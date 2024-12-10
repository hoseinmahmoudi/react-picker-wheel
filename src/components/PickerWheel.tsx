import React, { useState, useEffect, useRef } from 'react';
import styles from './styles.module.css';

type Items = string[];

type Props = {
    items: Items;
    onChange?: (item: string) => void;
};

const PickerWheel: React.FC<Props> = ({ items = [""] ,onChange}) => {
    function isSpaceLessThanFive(index1: number, index2: number): boolean {
        if (index1 === -1 || index2 === -1) {
            throw new Error("One or both items not found in the array.");
        }
        const distance = Math.abs(index1 - index2);
        const wrapAroundDistance = items.length - distance;
        return Math.min(distance, wrapAroundDistance) < 5;
    }

    const [currentItem, setCurrentItem] = useState(0);
    const [active, setActive] = useState("0");
    const ulRef = useRef<HTMLUListElement>(null);
    const touchStartY = useRef(0);
    const touchMoveAccumulator = useRef(0);
    const touchMoveThreshold = 20; // Threshold for touch move, reduced for better sensitivity

    useEffect(() => {
        const init = () => {
            const d = new Date();
            const itemNumber = d.getMonth() === 1 ? d.getDate() - 1 : 0;
            setCurrentItem(itemNumber);
            ulRef.current?.style.setProperty('--rotateDegrees', String(-360 / items.length));
            adjustDay(0);
        };

        const adjustDay = (nr: number) => {
            const itemNumber = currentItem + nr;
            setCurrentItem(itemNumber);
            ulRef.current?.style.setProperty('--currentItem', String(itemNumber));

            const activeEl = ulRef.current?.querySelector(`.${styles.active}`);
            if (activeEl) activeEl.classList.remove(styles.active);

            const activeIndex = (itemNumber % items.length + items.length) % items.length;
            const newActiveEl:HTMLLIElement | undefined | null = ulRef.current?.querySelector(`li:nth-child(${activeIndex + 1})`)
            newActiveEl?.classList.add(styles.active);
            if(newActiveEl?.id)  setActive(newActiveEl?.id );
            if(onChange) onChange(items[activeIndex])
        };

        init();
    }, [currentItem, active, items.length]);

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        touchStartY.current = e.touches[0].clientY;
        touchMoveAccumulator.current = 0;
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        const touchEndY = e.touches[0].clientY;
        const touchDiff = touchStartY.current - touchEndY;

        touchMoveAccumulator.current += touchDiff * 0.8; // Adjust damping factor for smoother experience
        touchStartY.current = touchEndY;

        if (Math.abs(touchMoveAccumulator.current) > touchMoveThreshold) {
            const direction = touchMoveAccumulator.current > 0 ? 1 : -1;
            setCurrentItem((prev) => prev + direction);
            touchMoveAccumulator.current = 0; // Reset accumulator after applying the change

        }
    };

    return (
        <div
            className={styles.container}
            onWheel={(event) => {
                if (event.deltaY < 0) {
                    setCurrentItem(currentItem - 1);
                } else {
                    setCurrentItem(currentItem + 1);
                }
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
        >
            <ul ref={ulRef} className={styles.list}>
                {items.map((item, idx) => (
                    <li
                        value={item}
                        key={idx}
                        id={idx.toString()}
                        style={{
                            '--item_idx': idx,
                            opacity: isSpaceLessThanFive(Number(active), idx) ? 1 : 0,
                        } as React.CSSProperties}
                        className={`${styles.item} ${currentItem === idx ? styles.active : ''}`}
                    >
                        <span className={styles.span}>{item}</span>
                    </li>
                ))}
            </ul>
            {/* <div className={styles.border}></div> */}
        </div>
    );
};

export default PickerWheel;

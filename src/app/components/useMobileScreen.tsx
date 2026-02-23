'use client'
import {useEffect, useState} from "react";

const useCheckMobileScreen = (): {isMobileScreen: boolean, width: number} => {
    const [width, setWidth] = useState<number>(typeof window !== "undefined" ? window.innerWidth : 0);
    const handleWindowSizeChange = () => {
        setWidth(window.innerWidth);
    }

    useEffect(() => {
        window.addEventListener('resize', handleWindowSizeChange);
        return () => {
            window.removeEventListener('resize', handleWindowSizeChange);
        }
    }, []);

    return {
        isMobileScreen: (width <= 1280),
        width: width
    };

}

export default useCheckMobileScreen
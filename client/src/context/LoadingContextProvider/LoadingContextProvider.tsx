/********************************************************************************************************************
 * Loading Context Provider
 * ******************************************************************************************************************/

import React from 'react';
import { LoadingContextProviderProps as Props } from './LoadingContextProvider.types';
import LoadingContext from '../LoadingContext';
import './LoadingContextProvider.scss';

const LoadingContextProvider: React.FC<Props> = ({ children }) => {
  /********************************************************************************************************************
   * Ref
   * ******************************************************************************************************************/

  const showCountRef = useRef(0);
  const notUseTimerRef = useRef<NodeJS.Timeout>(undefined);

  /********************************************************************************************************************
   * State
   * ******************************************************************************************************************/

  const [isUse, setIsUse] = useState(false);
  const [isShow, setIsShow] = useState(false);

  /********************************************************************************************************************
   * Function
   * ******************************************************************************************************************/

  const increaseShowCount = useCallback(() => {
    if (notUseTimerRef.current) {
      clearTimeout(notUseTimerRef.current);
      notUseTimerRef.current = undefined;
    }

    showCountRef.current += 1;
    setIsUse(true);
    setIsShow(true);
  }, []);

  const decreaseShowCount = useCallback(() => {
    if (showCountRef.current > 0) {
      showCountRef.current -= 1;
      if (showCountRef.current === 0) {
        setIsShow(false);

        if (notUseTimerRef.current) {
          clearTimeout(notUseTimerRef.current);
          notUseTimerRef.current = undefined;
        }

        notUseTimerRef.current = setTimeout(() => {
          notUseTimerRef.current = undefined;
          setIsUse(false);
        }, 300);
      }
    }
  }, []);

  const showLoading = useCallback(() => {
    increaseShowCount();
  }, [increaseShowCount]);

  const hideLoading = useCallback(() => {
    decreaseShowCount();
  }, [decreaseShowCount]);

  return (
    <LoadingContext.Provider
      value={{
        showLoading,
        hideLoading,
      }}
    >
      {isUse && (
        <div
          className={classnames(
            'LoadingContextProvider-Loading',
            isShow ? 'LoadingContextProvider-show' : 'LoadingContextProvider-hide'
          )}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          <div className='LoadingContextProvider-LoadingContent'>
            <div className='LoadingContextProvider-LoadingText' />
          </div>
        </div>
      )}
      {children}
    </LoadingContext.Provider>
  );
};

export default LoadingContextProvider;

import { useMediaQuery } from 'usehooks-ts';

const _mediaQuery = {
  minXsMin: '(min-width: 540px)',
  minXsMax: '(min-width: 575px)',
  maxXsMin: '(max-width: 540px)',
  maxXsMax: '(max-width: 575px)',
  minSmMin: '(min-width: 620px)',
  minSmMax: '(min-width: 767px)',
  maxSmMin: '(max-width: 620px)',
  maxSmMax: '(max-width: 767px)',
  minMdMin: '(min-width: 768px)',
  minMdMax: '(min-width: 993px)',
  maxMdMin: '(max-width: 768px)',
  maxMdMax: '(max-width: 993px)',
  minLgMin: '(min-width: 992px)',
  minLgMax: '(min-width: 1201px)',
  maxLgMin: '(max-width: 992px)',
  maxLgMax: '(max-width: 1201px)',
  minMax: '(min-width: 1301px)',
  maxMax: '(max-width: 1301px)',
} as const;

const _useScreenSize = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const isXxs = useMediaQuery('(max-width: 360px)');
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const isXs = useMediaQuery('(max-width: 540px)');
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const isSm = useMediaQuery('(max-width: 620px)');
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const isMd = useMediaQuery('(max-width: 992px)');
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const isLg = useMediaQuery('(max-width: 1200px)');
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const isMax = useMediaQuery('(min-width: 1301px)');

  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useMemo(() => {
    function screenValue(xxs: any, xs?: any, sm?: any, md?: any, lg?: any, max?: any) {
      const resultXxs = xxs;
      const resultXs = ifUndefined(xs, xxs);
      const resultSm = ifUndefined(sm, resultXs);
      const resultMd = ifUndefined(md, resultSm);
      const resultLg = ifUndefined(lg, resultMd);
      const resultMax = ifUndefined(max, resultLg);

      if (isXxs) return resultXxs;
      if (isXs) return resultXs;
      if (isSm) return resultSm;
      if (isMd) return resultMd;
      if (isLg) return resultLg;
      return resultMax;
    }

    const isExactXxs = isXxs;
    const isExactXs = !isXxs && isXs;
    const isExactSm = !isXxs && !isXs && isSm;
    const isExactMd = !isXxs && !isXs && !isSm && isMd;
    const isExactLg = !isXxs && !isXs && !isSm && !isMd && isLg;
    const isExactMax = !isXxs && !isXs && !isSm && !isMd && !isLg && isMax;

    return {
      screenValue,
      isXxs,
      isXs,
      isSm,
      isMd,
      isLg,
      isMax,
      isExactXxs,
      isExactXs,
      isExactSm,
      isExactMd,
      isExactLg,
      isExactMax,
    };
  }, [isXxs, isXs, isSm, isMd, isLg, isMax]);
};

/* eslint-disable no-var */
declare global {
  var mediaQuery: typeof _mediaQuery;
  var useScreenSize: typeof _useScreenSize;
}
/* eslint-enable no-var */

globalThis.mediaQuery = _mediaQuery;
globalThis.useScreenSize = _useScreenSize;

export {};

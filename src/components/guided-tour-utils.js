/**
 * Parameters
 */

// Tooltip gap (in px)
const tooltipGap = 40;

/**
 * Internal utility functions
 */

function getElementCoord(elem) {
  let x, y, w, h;

  if (Array.isArray(elem)) {
    let widestXW, highestYH;

    elem.map(e => {
      const { x: currentX, y: currentY, width: currentW, height: currentH } = e.getBoundingClientRect();

      if (!widestXW || widestXW < currentX + currentW) {
        widestXW = currentX + currentW;
      }

      if (!highestYH || highestYH < currentY + currentH) {
        highestYH = currentY + currentH;
      }

      if (!x || x > currentX) {
        x = currentX;
      }

      if (!y || y > currentY) {
        y = currentY;
      }

      w = widestXW - x;
      h = highestYH - y;
    });
  } else {
    const { x: currentX, y: currentY, width: currentW, height: currentH } = elem.getBoundingClientRect();

    x = currentX;
    y = currentY;
    w = currentW;
    h = currentH;
  }

  return { x, y, w, h };
}

function getWindowSize() {
  return {
    wWindow: window.innerWidth,
    hWindow: window.innerHeight,
  };
}

function getWindowScroll() {
  return {
    offsetXWindow: window.pageXOffset,
    offsetYWindow: window.pageYOffset,
  };
}

/**
 * Exported utility functions
 */

function isNegative(num) {
  return Math.sign(num) === -1;
}

async function scrollToTarget(target, element) {
  const { y, h } = getElementCoord(target);
  const { hWindow } = getWindowSize();

  const offsetYElement = element.offsetTop;
  const scrolledTop = element.scrollTop;

  if (isNegative(y)) {
    element.scroll({
      top: scrolledTop + y - tooltipGap,
    });
  }

  if (y < offsetYElement) {
    element.scroll({
      top: scrolledTop + y - offsetYElement - tooltipGap,
    });
  }

  if (y + h > hWindow) {
    element.scroll({
      top: y + h - hWindow + scrolledTop + tooltipGap,
    });
  }
}

function setArrow(arrow, position) {
  const style = {
    content: '',
    margin: 'auto',
    position: 'absolute',
    width: '25px',
    height: '25px',
    transform: 'rotate(45deg)',
    boxShadow: '5px 3px 0.9em, 0 0 rgba(0,0,0,0.5)',
  };

  let styleCompleted;

  switch (position) {
    case 'bottom':
      styleCompleted = {
        ...style,
        left: 0,
        right: 0,
        bottom: 'calc(100% - 12px)',
        backgroundColor: 'var(--color-silver-light)',
      };
      break;
    case 'top':
      styleCompleted = {
        ...style,
        left: 0,
        right: 0,
        bottom: '-12px',
        backgroundColor: 'var(--color-white)',
      };
      break;
    case 'up-left':
      styleCompleted = {
        ...style,
        right: '-12px',
        top: '-176px',
        bottom: 0,
        backgroundColor: 'var(--color-silver-light)',
      };
      break;
    case 'up-right':
      styleCompleted = {
        ...style,
        left: '-12px',
        top: '-176px',
        bottom: 0,
        backgroundColor: 'var(--color-silver-light)',
      };
      break;
    case 'down-left':
      styleCompleted = {
        ...style,
        right: '-12px',
        top: '150px',
        bottom: '0px',
        backgroundColor: 'var(--color-white)',
      };
      break;
    case 'down-right':
      styleCompleted = {
        ...style,
        left: '-12px',
        top: '150px',
        bottom: '0px',
        backgroundColor: 'var(--color-white)',
      };
  }
  Object.assign(arrow.style, styleCompleted);
}

function setTooltipPosition(target, tooltip, arrow, yOffset = 0, xOffset = 0) {
  const { x: xTarget, y: yTarget, w: targetWidth, h: targetHeight } = getElementCoord(target);

  const { w: tooltipWidth, h: tooltipHeight } = getElementCoord(tooltip);
  const { wWindow, hWindow } = getWindowSize();
  const { offsetXWindow, offsetYWindow } = getWindowScroll();

  let left, top;

  const targetLeft = offsetXWindow + xTarget;
  const tooltipTotalWidth = tooltipWidth + tooltipGap;

  const targetTop = offsetYWindow + yTarget;
  const tooltipTotalHeight = tooltipHeight + tooltipGap;

  const tooltipFitRight = wWindow - (targetLeft + targetWidth) > tooltipTotalWidth;
  const tooltipFitLeft = targetLeft > tooltipTotalWidth;

  if (tooltipFitRight) {
    left = targetLeft + targetWidth + tooltipGap;

    // align bottom
    if (hWindow - targetTop - targetHeight < tooltipTotalHeight - targetHeight) {
      top = targetTop + targetHeight - tooltipHeight;
      setArrow(arrow, 'down-right');
      // align top
    } else {
      top = targetTop;
      setArrow(arrow, 'up-right');
    }

    Object.assign(tooltip.style, {
      left: `${left + xOffset}px`,
      top: `${top + yOffset}px`,
    });
    return;
  }

  if (tooltipFitLeft) {
    left = targetLeft - tooltipTotalWidth;

    // align bottom
    if (hWindow - targetTop - targetHeight < tooltipTotalHeight - targetHeight) {
      top = targetTop + targetHeight - tooltipHeight;
      setArrow(arrow, 'down-left');
      // align top
    } else {
      top = targetTop;
      setArrow(arrow, 'up-left');
    }
    Object.assign(tooltip.style, {
      left: `${left + xOffset}px`,
      top: `${top + yOffset}px`,
    });
    return;
  }

  const tooltipFitTop = tooltipTotalHeight < targetTop - tooltipGap;
  const tooltipFitBottom = hWindow - (targetTop + targetHeight) > tooltipTotalHeight;

  if (tooltipFitTop) {
    setArrow(arrow, 'top');
    Object.assign(tooltip.style, {
      left: `${targetLeft + xOffset}px`,
      top: `${targetTop - tooltipTotalHeight + yOffset}px`,
    });
    return;
  }

  if (tooltipFitBottom) {
    setArrow(arrow, 'bottom');
    Object.assign(tooltip.style, {
      left: `${targetLeft + xOffset}px`,
      top: `${targetTop + targetHeight + tooltipGap + yOffset}px`,
    });
    return;
  }

  // tooltip in element
  Object.assign(tooltip.style, {
    left: `${targetLeft + targetWidth - tooltipWidth + xOffset}px`,
    top: `${targetTop + targetHeight - tooltipHeight + yOffset}px`,
  });
}

export { scrollToTarget, setTooltipPosition };

/**
 * Printing Press Cost Estimator & Paper Math Utility (No Tax - Clean & Simple)
 */

export const STANDARD_PAPER_SIZES = [
  { name: '20" x 30" (Demy)', width: 20, height: 30 },
  { name: '23" x 36" (Royal)', width: 23, height: 36 },
  { name: '25" x 37" (Double Demy)', width: 25, height: 37 },
  { name: '18" x 23" (Crown)', width: 18, height: 23 },
  { name: '12" x 18" (Digital Sheet)', width: 12, height: 18 },
  { name: '13" x 19" (Digital Super Sheet)', width: 13, height: 19 },
];

export const FINISHED_JOB_SIZES = [
  { name: 'A4 (8.27" x 11.69")', width: 8.27, height: 11.69 },
  { name: 'A5 (5.83" x 8.27")', width: 5.83, height: 8.27 },
  { name: 'A3 (11.69" x 16.54")', width: 11.69, height: 16.54 },
  { name: 'Letter (8.5" x 11")', width: 8.5, height: 11 },
  { name: 'Legal (8.5" x 14")', width: 8.5, height: 14 },
  { name: 'Business Card (3.5" x 2")', width: 3.5, height: 2 },
  { name: 'Flier / Brochure (8.5" x 3.66")', width: 8.5, height: 3.66 },
  { name: '6" x 9" Book', width: 6, height: 9 },
];

export const PAPER_TYPES = [
  { name: 'Art Paper (Gloss / Matte)', basePricePerReam: 145 },
  { name: 'Offset Paper (White / Cream)', basePricePerReam: 95 },
  { name: 'Duplex / Board Paper', basePricePerReam: 180 },
  { name: 'Kraft / Packaging Paper', basePricePerReam: 75 },
  { name: 'Specialty / Textured Paper', basePricePerReam: 240 },
];

/**
 * Calculate cuts per full sheet
 */
export function calculateCutsPerSheet(sheetW, sheetH, jobW, jobH) {
  if (!sheetW || !sheetH || !jobW || !jobH) {
    return { cuts: 1, cols: 1, rows: 1, isRotated: false, efficiency: 100 };
  }

  // Straight orientation
  const cols1 = Math.floor(sheetW / jobW);
  const rows1 = Math.floor(sheetH / jobH);
  const cuts1 = cols1 * rows1;

  // Rotated orientation
  const cols2 = Math.floor(sheetW / jobH);
  const rows2 = Math.floor(sheetH / jobW);
  const cuts2 = cols2 * rows2;

  const totalSheetArea = sheetW * sheetH;

  if (cuts1 >= cuts2 && cuts1 > 0) {
    const usedArea = cuts1 * jobW * jobH;
    const efficiency = Math.round((usedArea / totalSheetArea) * 100);
    return { cuts: cuts1, cols: cols1, rows: rows1, isRotated: false, efficiency, cutW: jobW, cutH: jobH };
  } else if (cuts2 > 0) {
    const usedArea = cuts2 * jobW * jobH;
    const efficiency = Math.round((usedArea / totalSheetArea) * 100);
    return { cuts: cuts2, cols: cols2, rows: rows2, isRotated: true, efficiency, cutW: jobH, cutH: jobW };
  }

  return { cuts: 1, cols: 1, rows: 1, isRotated: false, efficiency: 100, cutW: jobW, cutH: jobH };
}

/**
 * Print Estimate Calculation (Without Tax)
 */
export function calculatePrintEstimate(params) {
  const {
    quantity = 1000,
    pages = 1,
    sheetWidth = 23,
    sheetHeight = 36,
    jobWidth = 8.5,
    jobHeight = 11,
    gsm = 120,
    paperPricePerReam = 120, // 500 sheets
    wastagePercent = 5,
    colorFront = 4, // CMYK
    colorBack = 4,
    ctpPlateCost = 250, // per plate
    impressionRatePerThousand = 150, // per 1000 impressions
    laminationType = 'none',
    laminationRatePerSqFt = 0.5,
    bindingType = 'none',
    bindingRatePerCopy = 2,
    dieCutCost = 0,
    embossCost = 0,
    marginPercent = 20,
  } = params;

  const cutLayout = calculateCutsPerSheet(sheetWidth, sheetHeight, jobWidth, jobHeight);
  const cutsPerSheet = cutLayout.cuts;
  
  // Total sheets needed
  const totalSheetsNeededNet = Math.ceil((quantity * pages) / cutsPerSheet);
  const wastageSheets = Math.ceil(totalSheetsNeededNet * (wastagePercent / 100));
  const totalFullSheets = totalSheetsNeededNet + wastageSheets;

  const reamsNeeded = (totalFullSheets / 500).toFixed(2);
  const pricePerSheet = paperPricePerReam / 500;
  const paperCost = totalFullSheets * pricePerSheet;

  const paperWeightKg = ((sheetWidth * sheetHeight * gsm * totalFullSheets) / 3100000).toFixed(2);

  // CTP Plates
  const totalColors = Number(colorFront) + Number(colorBack);
  const formsCount = Math.max(1, Math.ceil(pages / (cutsPerSheet * 2)));
  const totalPlates = formsCount * Math.max(1, totalColors);
  const plateCost = totalPlates * ctpPlateCost;

  // Impression Cost
  const totalImpressions = totalFullSheets * (colorBack > 0 ? 2 : 1);
  const thousandImpressions = Math.max(1, Math.ceil(totalImpressions / 1000));
  const impressionCost = thousandImpressions * impressionRatePerThousand;

  // Lamination
  let laminationCost = 0;
  if (laminationType !== 'none') {
    const totalSqFt = (jobWidth * jobHeight * quantity) / 144;
    laminationCost = totalSqFt * laminationRatePerSqFt;
  }

  // Binding
  let bindingCost = 0;
  if (bindingType !== 'none') {
    bindingCost = quantity * bindingRatePerCopy;
  }

  const finishingCost = laminationCost + bindingCost + Number(dieCutCost) + Number(embossCost);
  const productionSubtotal = paperCost + plateCost + impressionCost + finishingCost;
  const marginAmount = productionSubtotal * (marginPercent / 100);

  const grandTotal = Math.round(productionSubtotal + marginAmount);
  const unitCost = quantity > 0 ? grandTotal / quantity : 0;

  return {
    cutsPerSheet,
    cutLayout,
    totalFullSheets,
    reamsNeeded,
    paperWeightKg,
    paperCost,
    totalPlates,
    plateCost,
    totalImpressions,
    impressionCost,
    laminationCost,
    bindingCost,
    finishingCost,
    productionSubtotal,
    marginAmount,
    grandTotal,
    unitCost
  };
}

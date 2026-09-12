import React, { useState, useEffect } from 'react';
import {
  Calculator,
  Sparkles,
  PlusCircle
} from 'lucide-react';
import {
  STANDARD_PAPER_SIZES,
  FINISHED_JOB_SIZES,
  PAPER_TYPES,
  calculatePrintEstimate
} from '../utils/printCalculator';

export default function PrintEstimator({
  clients,
  settings,
  currency,
  onCreateJobFromQuote,
}) {
  const [clientId, setClientId] = useState(clients[0]?.id || '');
  const [jobTitle, setJobTitle] = useState('Product Catalogues & Brochures');
  const [jobType, setJobType] = useState('Booklet / Catalog');
  const [quantity, setQuantity] = useState(5000);
  const [pages, setPages] = useState(16);

  // Paper settings
  const [selectedSheetSize, setSelectedSheetSize] = useState(STANDARD_PAPER_SIZES[1]); // 23x36
  const [selectedJobSize, setSelectedJobSize] = useState(FINISHED_JOB_SIZES[0]); // A4
  const [paperType, setPaperType] = useState(PAPER_TYPES[0]);
  const [gsm, setGsm] = useState(150);
  const [paperPricePerReam, setPaperPricePerReam] = useState(145);
  const [wastagePercent, setWastagePercent] = useState(5);

  // Press & Plate settings
  const [colorFront, setColorFront] = useState(4); // CMYK
  const [colorBack, setColorBack] = useState(4);
  const [ctpPlateCost, setCtpPlateCost] = useState(settings?.ctpPlateRate || 15);
  const [impressionRate, setImpressionRate] = useState(settings?.impressionRatePerThousand || 8);

  // Post-press Finishing
  const [laminationType, setLaminationType] = useState('gloss'); // gloss, matte, none
  const [laminationRate, setLaminationRate] = useState(0.05); // per sq ft
  const [bindingType, setBindingType] = useState('saddle'); // saddle, perfect, none
  const [bindingRate, setBindingRate] = useState(0.20); // per book
  const [dieCutCost, setDieCutCost] = useState(0);
  const [embossCost, setEmbossCost] = useState(0);

  // Margins
  const [marginPercent, setMarginPercent] = useState(25);
  const [taxPercent, setTaxPercent] = useState(settings?.defaultTaxPercent || 5);

  // Calculation output state
  const [estimate, setEstimate] = useState(null);

  useEffect(() => {
    const res = calculatePrintEstimate({
      quantity: Number(quantity) || 1,
      pages: Number(pages) || 1,
      sheetWidth: selectedSheetSize.width,
      sheetHeight: selectedSheetSize.height,
      jobWidth: selectedJobSize.width,
      jobHeight: selectedJobSize.height,
      gsm: Number(gsm) || 120,
      paperPricePerReam: Number(paperPricePerReam) || 100,
      wastagePercent: Number(wastagePercent) || 5,
      colorFront: Number(colorFront),
      colorBack: Number(colorBack),
      ctpPlateCost: Number(ctpPlateCost),
      impressionRatePerThousand: Number(impressionRate),
      laminationType,
      laminationRatePerSqFt: Number(laminationRate),
      bindingType,
      bindingRatePerCopy: Number(bindingRate),
      dieCutCost: Number(dieCutCost),
      embossCost: Number(embossCost),
      marginPercent: Number(marginPercent),
      taxPercent: Number(taxPercent),
    });
    setEstimate(res);
  }, [
    quantity,
    pages,
    selectedSheetSize,
    selectedJobSize,
    gsm,
    paperPricePerReam,
    wastagePercent,
    colorFront,
    colorBack,
    ctpPlateCost,
    impressionRate,
    laminationType,
    laminationRate,
    bindingType,
    bindingRate,
    dieCutCost,
    embossCost,
    marginPercent,
    taxPercent,
  ]);

  const handleConvertQuote = () => {
    const selectedClient = clients.find((c) => c.id === clientId);
    const newJob = {
      title: jobTitle || 'Custom Print Job',
      clientId,
      clientName: selectedClient ? selectedClient.name : 'Walk-in Client',
      jobType,
      paper: `${gsm}gsm ${paperType.name} (${selectedSheetSize.name})`,
      finishedSize: selectedJobSize.name,
      pages: Number(pages),
      quantity: Number(quantity),
      totalCost: estimate ? Math.round(estimate.grandTotal) : 0,
      stage: 'Pre-Press',
      notes: `Paper: ${selectedSheetSize.name}, Cuts: ${estimate?.cutsPerSheet}/sheet. Colors: ${colorFront}/${colorBack}. Lamination: ${laminationType}, Binding: ${bindingType}.`,
    };
    onCreateJobFromQuote(newJob);
  };

  return (
    <div className="print-estimator-view">
      <div className="calculator-grid">
        {/* Left Column: Form Inputs */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calculator size={20} style={{ color: 'var(--accent-primary)' }} />
            Print Job Specifications
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Job Title / Description</label>
              <input
                type="text"
                className="form-control"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. 5,000 Copies Brochure"
              />
            </div>

            <div className="form-group">
              <label>Select Client</label>
              <select
                className="form-select"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Job Category</label>
              <select className="form-select" value={jobType} onChange={(e) => setJobType(e.target.value)}>
                <option value="Flyer">Flyer / Leaflet</option>
                <option value="Booklet / Catalog">Booklet / Catalog</option>
                <option value="Hardcover Book">Hardcover Book</option>
                <option value="Packaging Box">Packaging Box</option>
                <option value="Business Cards">Business Cards</option>
                <option value="Poster / Banner">Poster / Banner</option>
              </select>
            </div>

            <div className="form-group">
              <label>Quantity (Copies)</label>
              <input
                type="number"
                className="form-control"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="1"
              />
            </div>

            <div className="form-group">
              <label>Total Pages (Sides)</label>
              <input
                type="number"
                className="form-control"
                value={pages}
                onChange={(e) => setPages(e.target.value)}
                min="1"
              />
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '1.25rem 0' }} />

          {/* Paper Calculations Section */}
          <h3 style={{ fontSize: '0.95rem', marginBottom: '1rem', color: 'var(--accent-primary)' }}>
            1. Paper & Cutting Sheet Setup
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Full Sheet Paper Size</label>
              <select
                className="form-select"
                value={selectedSheetSize.name}
                onChange={(e) => {
                  const found = STANDARD_PAPER_SIZES.find((s) => s.name === e.target.value);
                  if (found) setSelectedSheetSize(found);
                }}
              >
                {STANDARD_PAPER_SIZES.map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Finished Cut Size</label>
              <select
                className="form-select"
                value={selectedJobSize.name}
                onChange={(e) => {
                  const found = FINISHED_JOB_SIZES.find((s) => s.name === e.target.value);
                  if (found) setSelectedJobSize(found);
                }}
              >
                {FINISHED_JOB_SIZES.map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label>Paper Type</label>
              <select
                className="form-select"
                value={paperType.name}
                onChange={(e) => {
                  const found = PAPER_TYPES.find((p) => p.name === e.target.value);
                  if (found) {
                    setPaperType(found);
                    setPaperPricePerReam(found.basePricePerReam);
                  }
                }}
              >
                {PAPER_TYPES.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Paper GSM</label>
              <input
                type="number"
                className="form-control"
                value={gsm}
                onChange={(e) => setGsm(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Ream Price ({currency})</label>
              <input
                type="number"
                className="form-control"
                value={paperPricePerReam}
                onChange={(e) => setPaperPricePerReam(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Wastage %</label>
              <input
                type="number"
                className="form-control"
                value={wastagePercent}
                onChange={(e) => setWastagePercent(e.target.value)}
              />
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '1.25rem 0' }} />

          {/* Plates & Machine Impressions */}
          <h3 style={{ fontSize: '0.95rem', marginBottom: '1rem', color: 'var(--accent-primary)' }}>
            2. CTP Plates & Press Running Rates
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label>Colors Front</label>
              <select className="form-select" value={colorFront} onChange={(e) => setColorFront(e.target.value)}>
                <option value="4">4 (CMYK Full Color)</option>
                <option value="2">2 (2-Color)</option>
                <option value="1">1 (Single Color)</option>
                <option value="0">0 (Blank)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Colors Back</label>
              <select className="form-select" value={colorBack} onChange={(e) => setColorBack(e.target.value)}>
                <option value="4">4 (CMYK Full Color)</option>
                <option value="2">2 (2-Color)</option>
                <option value="1">1 (Single Color)</option>
                <option value="0">0 (Single Sided)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Plate Cost ({currency})</label>
              <input
                type="number"
                className="form-control"
                value={ctpPlateCost}
                onChange={(e) => setCtpPlateCost(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Impression / 1k ({currency})</label>
              <input
                type="number"
                className="form-control"
                value={impressionRate}
                onChange={(e) => setImpressionRate(e.target.value)}
              />
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '1.25rem 0' }} />

          {/* Post-press Finishing */}
          <h3 style={{ fontSize: '0.95rem', marginBottom: '1rem', color: 'var(--accent-primary)' }}>
            3. Post-Press Finishing & Binding
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label>Lamination</label>
              <select className="form-select" value={laminationType} onChange={(e) => setLaminationType(e.target.value)}>
                <option value="none">None</option>
                <option value="gloss">Gloss Thermal</option>
                <option value="matte">Matte Thermal</option>
                <option value="velvet">Velvet Soft Touch</option>
              </select>
            </div>

            <div className="form-group">
              <label>Binding Type</label>
              <select className="form-select" value={bindingType} onChange={(e) => setBindingType(e.target.value)}>
                <option value="none">None / Cut to size</option>
                <option value="saddle">Saddle Stitching</option>
                <option value="perfect">Perfect Glue Binding</option>
                <option value="hardcover">Hardcover Case Binding</option>
              </select>
            </div>

            <div className="form-group">
              <label>Die-Cutting Cost ({currency})</label>
              <input
                type="number"
                className="form-control"
                value={dieCutCost}
                onChange={(e) => setDieCutCost(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Margin %</label>
              <input
                type="number"
                className="form-control"
                value={marginPercent}
                onChange={(e) => setMarginPercent(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Live Calculation Summary & Action */}
        <div className="calc-summary-panel">
          <div className="glass-panel" style={{ padding: '1.5rem', background: 'var(--bg-secondary)' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={20} style={{ color: 'var(--warning)' }} />
              Estimate Cost Breakdown
            </h2>

            {estimate && (
              <div>
                <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                    <span>Paper Cuts per Sheet:</span>
                    <strong style={{ color: 'var(--accent-primary)' }}>{estimate.cutsPerSheet} Cuts</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                    <span>Total Sheets Required:</span>
                    <strong>{estimate.totalFullSheets.toLocaleString()} Sheets ({estimate.reamsNeeded} Reams)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span>Estimated Paper Weight:</span>
                    <span>{estimate.paperWeightKg} KG</span>
                  </div>

                  {estimate?.cutLayout && (
                    <div style={{ marginTop: '0.85rem', paddingTop: '0.75rem', borderTop: '1px dashed var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', fontSize: '0.75rem' }}>
                        <span>Full Sheet Cut Efficiency</span>
                        <span className="badge badge-success">{estimate.cutLayout.efficiency}% Efficiency</span>
                      </div>
                      
                      <div style={{ border: '2px dashed var(--accent-primary)', padding: '6px', background: 'rgba(14, 165, 233, 0.05)', borderRadius: '6px' }}>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: `repeat(${Math.min(estimate.cutLayout.cols, 6)}, 1fr)`,
                          gap: '4px'
                        }}>
                          {Array.from({ length: Math.min(estimate.cutLayout.cuts, 24) }).map((_, idx) => (
                            <div
                              key={idx}
                              style={{
                                background: 'var(--accent-gradient)',
                                color: '#fff',
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                padding: '4px 2px',
                                textAlign: 'center',
                                borderRadius: '3px'
                              }}
                            >
                              Cut {idx + 1}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="cost-row">
                  <span>Paper Raw Cost:</span>
                  <span>{currency}{estimate.paperCost.toFixed(2)}</span>
                </div>

                <div className="cost-row">
                  <span>CTP Plates Cost ({estimate.totalPlates} Plates):</span>
                  <span>{currency}{estimate.plateCost.toFixed(2)}</span>
                </div>

                <div className="cost-row">
                  <span>Press Impression Charges ({estimate.totalImpressions.toLocaleString()} Imp.):</span>
                  <span>{currency}{estimate.impressionCost.toFixed(2)}</span>
                </div>

                <div className="cost-row">
                  <span>Lamination & Finishing:</span>
                  <span>{currency}{estimate.finishingCost.toFixed(2)}</span>
                </div>

                <div className="cost-row">
                  <span>Net Cost Subtotal:</span>
                  <span>{currency}{estimate.productionSubtotal.toFixed(2)}</span>
                </div>

                <div className="cost-row">
                  <span>Profit Margin ({marginPercent}%):</span>
                  <span style={{ color: 'var(--success)' }}>+{currency}{estimate.marginAmount.toFixed(2)}</span>
                </div>

                <div className="cost-row total">
                  <span>Grand Total Price:</span>
                  <span>{currency}{estimate.grandTotal.toFixed(2)}</span>
                </div>

                <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Unit Cost: <strong>{currency}{estimate.unitCost.toFixed(3)}</strong> / piece
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '1.25rem 0' }} />

                <button
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%' }}
                  onClick={handleConvertQuote}
                >
                  <PlusCircle size={20} />
                  <span>Convert to Active Job Order</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

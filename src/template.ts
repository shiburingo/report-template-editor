export const REMITTANCE_TEMPLATE_KEY = 'reportTemplates.remittance';

export type RemittanceTemplate = {
  version: 1;
  text: {
    docTitle: string;
    detailTitle: string;
    copyLabelTop: string;
    copyLabelBottom: string;
    tableDateHeader: string;
    tableCashHeader: string;
    emptyLabel: string;
    totalLabel: string;
    signatureLabel: string;
    rangeTemplate: string;
    createdAtSuffix: string;
  };
  layout: {
    contentPaddingTopMm: number;
    contentPaddingSideMm: number;
    halfShiftMm: number;
    frameHeightMm: number;
    framePaddingMm: number;
    framePaddingBottomMm: number;
    titleFontPx: number;
    metaFontPx: number;
    subFontPx: number;
    tableFontPx: number;
    totalFontPx: number;
    footerFontPx: number;
    signatureFontPx: number;
    signatureBoxMm: number;
    lineWidthPx: number;
    tableRowPaddingMm: number;
    qrSizeMm: number;
  };
};

export const DEFAULT_REMITTANCE_TEMPLATE: RemittanceTemplate = {
  version: 1,
  text: {
    docTitle: '美祢市養鱒場売上金納付書',
    detailTitle: '現金売上日別明細',
    copyLabelTop: '納付元控え',
    copyLabelBottom: '納付先控え',
    tableDateHeader: '日付',
    tableCashHeader: '現金売上',
    emptyLabel: '対象期間の現金売上がありません。',
    totalLabel: '合計',
    signatureLabel: '担当者署名',
    rangeTemplate: '{start}から{end}まで',
    createdAtSuffix: '作成',
  },
  layout: {
    contentPaddingTopMm: 10,
    contentPaddingSideMm: 25,
    halfShiftMm: 12.5,
    frameHeightMm: 115,
    framePaddingMm: 6,
    framePaddingBottomMm: 5,
    titleFontPx: 15,
    metaFontPx: 10.5,
    subFontPx: 11,
    tableFontPx: 9.5,
    totalFontPx: 10.5,
    footerFontPx: 10,
    signatureFontPx: 9,
    signatureBoxMm: 20,
    lineWidthPx: 1,
    tableRowPaddingMm: 2,
    qrSizeMm: 20,
  },
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export const normalizeRemittanceTemplate = (input: unknown): RemittanceTemplate => {
  if (!isObject(input)) return DEFAULT_REMITTANCE_TEMPLATE;
  const text = isObject(input.text) ? input.text : {};
  const layout = isObject(input.layout) ? input.layout : {};
  return {
    version: 1,
    text: {
      docTitle: String(text.docTitle ?? DEFAULT_REMITTANCE_TEMPLATE.text.docTitle),
      detailTitle: String(text.detailTitle ?? DEFAULT_REMITTANCE_TEMPLATE.text.detailTitle),
      copyLabelTop: String(text.copyLabelTop ?? DEFAULT_REMITTANCE_TEMPLATE.text.copyLabelTop),
      copyLabelBottom: String(text.copyLabelBottom ?? DEFAULT_REMITTANCE_TEMPLATE.text.copyLabelBottom),
      tableDateHeader: String(text.tableDateHeader ?? DEFAULT_REMITTANCE_TEMPLATE.text.tableDateHeader),
      tableCashHeader: String(text.tableCashHeader ?? DEFAULT_REMITTANCE_TEMPLATE.text.tableCashHeader),
      emptyLabel: String(text.emptyLabel ?? DEFAULT_REMITTANCE_TEMPLATE.text.emptyLabel),
      totalLabel: String(text.totalLabel ?? DEFAULT_REMITTANCE_TEMPLATE.text.totalLabel),
      signatureLabel: String(text.signatureLabel ?? DEFAULT_REMITTANCE_TEMPLATE.text.signatureLabel),
      rangeTemplate: String(text.rangeTemplate ?? DEFAULT_REMITTANCE_TEMPLATE.text.rangeTemplate),
      createdAtSuffix: String(text.createdAtSuffix ?? DEFAULT_REMITTANCE_TEMPLATE.text.createdAtSuffix),
    },
    layout: {
      contentPaddingTopMm: Number(layout.contentPaddingTopMm ?? DEFAULT_REMITTANCE_TEMPLATE.layout.contentPaddingTopMm),
      contentPaddingSideMm: Number(layout.contentPaddingSideMm ?? DEFAULT_REMITTANCE_TEMPLATE.layout.contentPaddingSideMm),
      halfShiftMm: Number(layout.halfShiftMm ?? DEFAULT_REMITTANCE_TEMPLATE.layout.halfShiftMm),
      frameHeightMm: Number(layout.frameHeightMm ?? DEFAULT_REMITTANCE_TEMPLATE.layout.frameHeightMm),
      framePaddingMm: Number(layout.framePaddingMm ?? DEFAULT_REMITTANCE_TEMPLATE.layout.framePaddingMm),
      framePaddingBottomMm: Number(layout.framePaddingBottomMm ?? DEFAULT_REMITTANCE_TEMPLATE.layout.framePaddingBottomMm),
      titleFontPx: Number(layout.titleFontPx ?? DEFAULT_REMITTANCE_TEMPLATE.layout.titleFontPx),
      metaFontPx: Number(layout.metaFontPx ?? DEFAULT_REMITTANCE_TEMPLATE.layout.metaFontPx),
      subFontPx: Number(layout.subFontPx ?? DEFAULT_REMITTANCE_TEMPLATE.layout.subFontPx),
      tableFontPx: Number(layout.tableFontPx ?? DEFAULT_REMITTANCE_TEMPLATE.layout.tableFontPx),
      totalFontPx: Number(layout.totalFontPx ?? DEFAULT_REMITTANCE_TEMPLATE.layout.totalFontPx),
      footerFontPx: Number(layout.footerFontPx ?? DEFAULT_REMITTANCE_TEMPLATE.layout.footerFontPx),
      signatureFontPx: Number(layout.signatureFontPx ?? DEFAULT_REMITTANCE_TEMPLATE.layout.signatureFontPx),
      signatureBoxMm: Number(layout.signatureBoxMm ?? DEFAULT_REMITTANCE_TEMPLATE.layout.signatureBoxMm),
      lineWidthPx: Number(layout.lineWidthPx ?? DEFAULT_REMITTANCE_TEMPLATE.layout.lineWidthPx),
      tableRowPaddingMm: Number(layout.tableRowPaddingMm ?? DEFAULT_REMITTANCE_TEMPLATE.layout.tableRowPaddingMm),
      qrSizeMm: Number(layout.qrSizeMm ?? DEFAULT_REMITTANCE_TEMPLATE.layout.qrSizeMm),
    },
  };
};

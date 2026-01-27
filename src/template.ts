export const REMITTANCE_TEMPLATE_KEY = 'reportTemplates.remittance';
export const REMITTANCE_AR_TEMPLATE_KEY = 'reportTemplates.remittanceAr';
export const SALES_DAILY_TEMPLATE_KEY = 'reportTemplates.salesDaily';
export const FV_YEAR_COMPARISON_TEMPLATE_KEY = 'reportTemplates.foreignVisitorYearComparison';
export const AR_INVOICE_SETTINGS_KEY = 'ar.invoiceSettings.v1';
export const AR_DELIVERY_NOTE_SETTINGS_KEY = 'ar.deliveryNoteSettings.v1';

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

export type SalesDailyTemplate = {
  version: 1;
  text: {
    title: string;
    metaTemplate: string;
    receivableTemplate: string;
    metricsTemplate: string;
    sectionPayment: string;
    sectionCategory: string;
    sectionPrevious: string;
    totalLabel: string;
    noneLabel: string;
    labels: {
      cash: string;
      credit: string;
      mobile: string;
      receivable: string;
    };
  };
  layout: {
    pageMarginMm: number;
    titleFontPx: number;
    metaFontPx: number;
    sectionGapPx: number;
    sectionBorderPx: number;
    sectionPaddingPx: number;
    labelFontPx: number;
    rowFontPx: number;
    rowSmallFontPx: number;
    prevGridGapPx: number;
  };
};

export type ForeignVisitorYearComparisonTemplate = {
  version: 1;
  text: {
    orgName: string;
    docTitle: string;
    targetYearsLabel: string;
    badgeLabel: string;
    printedAtLabel: string;
  };
  layout: {
    pageMarginTopMm: number;
    pageMarginSideMm: number;
    pageMarginBottomMm: number;
    orgFontPx: number;
    titleFontPx: number;
    metaFontPx: number;
    badgeFontPx: number;
    headerGapPx: number;
    detailFontPx: number;
    detailPaddingPx: number;
  };
};

export type ArInvoiceSettings = {
  version: 1;
  title: string;
  amountLabel: string;
  subjectPrefix: string;
  showBank: boolean;
  showNotes: boolean;
  notesText: string;
  titleFontSize: number;
  bodyFontSize: number;
  amountFontSize: number;
  headerHeightMm: number;
  rowHeightMm: number;
  topMarginMm: number;
  sideMarginMm: number;
  lineWidth: number;
};

export type ArDeliveryNoteSettings = {
  version: 1;
  title: string;
  issuerName: string;
  issuerAddress: string;
  issuerPhone: string;
  footerNote: string;
  topMarginMm: number;
  leftMarginMm: number;
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
    signatureLabel: '署名：',
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
    signatureBoxMm: 50,
    lineWidthPx: 1,
    tableRowPaddingMm: 2,
    qrSizeMm: 20,
  },
};

export const DEFAULT_REMITTANCE_AR_TEMPLATE: RemittanceTemplate = {
  version: 1,
  text: {
    docTitle: '美祢市養鱒場売掛金入金納付書',
    detailTitle: '売掛金入金明細',
    copyLabelTop: '納付元控え',
    copyLabelBottom: '納付先控え',
    tableDateHeader: '顧客 / 対象月 / メモ',
    tableCashHeader: '入金額',
    emptyLabel: '対象月の売掛金入金がありません。',
    totalLabel: '合計',
    signatureLabel: '署名：',
    rangeTemplate: '対象月: {start}',
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
    signatureBoxMm: 50,
    lineWidthPx: 1,
    tableRowPaddingMm: 2,
    qrSizeMm: 20,
  },
};

export const DEFAULT_SALES_DAILY_TEMPLATE: SalesDailyTemplate = {
  version: 1,
  text: {
    title: '美祢市養鱒場売上日報',
    metaTemplate: '日付: {date} / {fiscal}',
    receivableTemplate: '売掛入金: {label}',
    metricsTemplate: '{metrics}',
    sectionPayment: '当日（支払い区分別）',
    sectionCategory: '品目別（補助）',
    sectionPrevious: '過去数日（支払い区分別）',
    totalLabel: '計',
    noneLabel: 'なし',
    labels: {
      cash: '現金',
      credit: 'クレジット',
      mobile: 'スマホ',
      receivable: '売掛',
    },
  },
  layout: {
    pageMarginMm: 10,
    titleFontPx: 20,
    metaFontPx: 12,
    sectionGapPx: 12,
    sectionBorderPx: 1,
    sectionPaddingPx: 10,
    labelFontPx: 12,
    rowFontPx: 16,
    rowSmallFontPx: 11,
    prevGridGapPx: 8,
  },
};

export const DEFAULT_FV_YEAR_COMPARISON_TEMPLATE: ForeignVisitorYearComparisonTemplate = {
  version: 1,
  text: {
    orgName: '美祢市養鱒場',
    docTitle: 'インバウンド記録（年別比較）',
    targetYearsLabel: '対象年',
    badgeLabel: '提出用参考資料',
    printedAtLabel: '印刷日時',
  },
  layout: {
    pageMarginTopMm: 12,
    pageMarginSideMm: 12,
    pageMarginBottomMm: 16,
    orgFontPx: 11,
    titleFontPx: 20,
    metaFontPx: 11,
    badgeFontPx: 11,
    headerGapPx: 10,
    detailFontPx: 10,
    detailPaddingPx: 5,
  },
};

export const DEFAULT_AR_INVOICE_SETTINGS: ArInvoiceSettings = {
  version: 1,
  title: '請求書',
  amountLabel: 'ご請求金額(税込)：',
  subjectPrefix: '請求期間',
  showBank: true,
  showNotes: true,
  notesText: '',
  titleFontSize: 18,
  bodyFontSize: 9,
  amountFontSize: 14,
  headerHeightMm: 7,
  rowHeightMm: 6,
  topMarginMm: 14,
  sideMarginMm: 16,
  lineWidth: 1,
};

export const DEFAULT_AR_DELIVERY_NOTE_SETTINGS: ArDeliveryNoteSettings = {
  version: 1,
  title: '納品書',
  issuerName: '',
  issuerAddress: '',
  issuerPhone: '',
  footerNote: '',
  topMarginMm: 18,
  leftMarginMm: 18,
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

export const normalizeRemittanceArTemplate = (input: unknown): RemittanceTemplate => {
  if (!isObject(input)) return DEFAULT_REMITTANCE_AR_TEMPLATE;
  const text = isObject(input.text) ? input.text : {};
  const layout = isObject(input.layout) ? input.layout : {};
  return {
    version: 1,
    text: {
      docTitle: String(text.docTitle ?? DEFAULT_REMITTANCE_AR_TEMPLATE.text.docTitle),
      detailTitle: String(text.detailTitle ?? DEFAULT_REMITTANCE_AR_TEMPLATE.text.detailTitle),
      copyLabelTop: String(text.copyLabelTop ?? DEFAULT_REMITTANCE_AR_TEMPLATE.text.copyLabelTop),
      copyLabelBottom: String(text.copyLabelBottom ?? DEFAULT_REMITTANCE_AR_TEMPLATE.text.copyLabelBottom),
      tableDateHeader: String(text.tableDateHeader ?? DEFAULT_REMITTANCE_AR_TEMPLATE.text.tableDateHeader),
      tableCashHeader: String(text.tableCashHeader ?? DEFAULT_REMITTANCE_AR_TEMPLATE.text.tableCashHeader),
      emptyLabel: String(text.emptyLabel ?? DEFAULT_REMITTANCE_AR_TEMPLATE.text.emptyLabel),
      totalLabel: String(text.totalLabel ?? DEFAULT_REMITTANCE_AR_TEMPLATE.text.totalLabel),
      signatureLabel: String(text.signatureLabel ?? DEFAULT_REMITTANCE_AR_TEMPLATE.text.signatureLabel),
      rangeTemplate: String(text.rangeTemplate ?? DEFAULT_REMITTANCE_AR_TEMPLATE.text.rangeTemplate),
      createdAtSuffix: String(text.createdAtSuffix ?? DEFAULT_REMITTANCE_AR_TEMPLATE.text.createdAtSuffix),
    },
    layout: {
      contentPaddingTopMm: Number(layout.contentPaddingTopMm ?? DEFAULT_REMITTANCE_AR_TEMPLATE.layout.contentPaddingTopMm),
      contentPaddingSideMm: Number(layout.contentPaddingSideMm ?? DEFAULT_REMITTANCE_AR_TEMPLATE.layout.contentPaddingSideMm),
      halfShiftMm: Number(layout.halfShiftMm ?? DEFAULT_REMITTANCE_AR_TEMPLATE.layout.halfShiftMm),
      frameHeightMm: Number(layout.frameHeightMm ?? DEFAULT_REMITTANCE_AR_TEMPLATE.layout.frameHeightMm),
      framePaddingMm: Number(layout.framePaddingMm ?? DEFAULT_REMITTANCE_AR_TEMPLATE.layout.framePaddingMm),
      framePaddingBottomMm: Number(
        layout.framePaddingBottomMm ?? DEFAULT_REMITTANCE_AR_TEMPLATE.layout.framePaddingBottomMm
      ),
      titleFontPx: Number(layout.titleFontPx ?? DEFAULT_REMITTANCE_AR_TEMPLATE.layout.titleFontPx),
      metaFontPx: Number(layout.metaFontPx ?? DEFAULT_REMITTANCE_AR_TEMPLATE.layout.metaFontPx),
      subFontPx: Number(layout.subFontPx ?? DEFAULT_REMITTANCE_AR_TEMPLATE.layout.subFontPx),
      tableFontPx: Number(layout.tableFontPx ?? DEFAULT_REMITTANCE_AR_TEMPLATE.layout.tableFontPx),
      totalFontPx: Number(layout.totalFontPx ?? DEFAULT_REMITTANCE_AR_TEMPLATE.layout.totalFontPx),
      footerFontPx: Number(layout.footerFontPx ?? DEFAULT_REMITTANCE_AR_TEMPLATE.layout.footerFontPx),
      signatureFontPx: Number(layout.signatureFontPx ?? DEFAULT_REMITTANCE_AR_TEMPLATE.layout.signatureFontPx),
      signatureBoxMm: Number(layout.signatureBoxMm ?? DEFAULT_REMITTANCE_AR_TEMPLATE.layout.signatureBoxMm),
      lineWidthPx: Number(layout.lineWidthPx ?? DEFAULT_REMITTANCE_AR_TEMPLATE.layout.lineWidthPx),
      tableRowPaddingMm: Number(layout.tableRowPaddingMm ?? DEFAULT_REMITTANCE_AR_TEMPLATE.layout.tableRowPaddingMm),
      qrSizeMm: Number(layout.qrSizeMm ?? DEFAULT_REMITTANCE_AR_TEMPLATE.layout.qrSizeMm),
    },
  };
};

export const normalizeSalesDailyTemplate = (input: unknown): SalesDailyTemplate => {
  if (!isObject(input)) return DEFAULT_SALES_DAILY_TEMPLATE;
  const text = isObject(input.text) ? input.text : {};
  const labels = isObject((text as any).labels) ? (text as any).labels : {};
  const layout = isObject(input.layout) ? input.layout : {};

  return {
    version: 1,
    text: {
      title: String(text.title ?? DEFAULT_SALES_DAILY_TEMPLATE.text.title),
      metaTemplate: String(text.metaTemplate ?? DEFAULT_SALES_DAILY_TEMPLATE.text.metaTemplate),
      receivableTemplate: String(text.receivableTemplate ?? DEFAULT_SALES_DAILY_TEMPLATE.text.receivableTemplate),
      metricsTemplate: String(text.metricsTemplate ?? DEFAULT_SALES_DAILY_TEMPLATE.text.metricsTemplate),
      sectionPayment: String(text.sectionPayment ?? DEFAULT_SALES_DAILY_TEMPLATE.text.sectionPayment),
      sectionCategory: String(text.sectionCategory ?? DEFAULT_SALES_DAILY_TEMPLATE.text.sectionCategory),
      sectionPrevious: String(text.sectionPrevious ?? DEFAULT_SALES_DAILY_TEMPLATE.text.sectionPrevious),
      totalLabel: String(text.totalLabel ?? DEFAULT_SALES_DAILY_TEMPLATE.text.totalLabel),
      noneLabel: String(text.noneLabel ?? DEFAULT_SALES_DAILY_TEMPLATE.text.noneLabel),
      labels: {
        cash: String(labels.cash ?? DEFAULT_SALES_DAILY_TEMPLATE.text.labels.cash),
        credit: String(labels.credit ?? DEFAULT_SALES_DAILY_TEMPLATE.text.labels.credit),
        mobile: String(labels.mobile ?? DEFAULT_SALES_DAILY_TEMPLATE.text.labels.mobile),
        receivable: String(labels.receivable ?? DEFAULT_SALES_DAILY_TEMPLATE.text.labels.receivable),
      },
    },
    layout: {
      pageMarginMm: Number(layout.pageMarginMm ?? DEFAULT_SALES_DAILY_TEMPLATE.layout.pageMarginMm),
      titleFontPx: Number(layout.titleFontPx ?? DEFAULT_SALES_DAILY_TEMPLATE.layout.titleFontPx),
      metaFontPx: Number(layout.metaFontPx ?? DEFAULT_SALES_DAILY_TEMPLATE.layout.metaFontPx),
      sectionGapPx: Number(layout.sectionGapPx ?? DEFAULT_SALES_DAILY_TEMPLATE.layout.sectionGapPx),
      sectionBorderPx: Number(layout.sectionBorderPx ?? DEFAULT_SALES_DAILY_TEMPLATE.layout.sectionBorderPx),
      sectionPaddingPx: Number(layout.sectionPaddingPx ?? DEFAULT_SALES_DAILY_TEMPLATE.layout.sectionPaddingPx),
      labelFontPx: Number(layout.labelFontPx ?? DEFAULT_SALES_DAILY_TEMPLATE.layout.labelFontPx),
      rowFontPx: Number(layout.rowFontPx ?? DEFAULT_SALES_DAILY_TEMPLATE.layout.rowFontPx),
      rowSmallFontPx: Number(layout.rowSmallFontPx ?? DEFAULT_SALES_DAILY_TEMPLATE.layout.rowSmallFontPx),
      prevGridGapPx: Number(layout.prevGridGapPx ?? DEFAULT_SALES_DAILY_TEMPLATE.layout.prevGridGapPx),
    },
  };
};

export const normalizeForeignVisitorTemplate = (input: unknown): ForeignVisitorYearComparisonTemplate => {
  if (!isObject(input)) return DEFAULT_FV_YEAR_COMPARISON_TEMPLATE;
  const text = isObject(input.text) ? input.text : {};
  const layout = isObject(input.layout) ? input.layout : {};
  return {
    version: 1,
    text: {
      orgName: String(text.orgName ?? DEFAULT_FV_YEAR_COMPARISON_TEMPLATE.text.orgName),
      docTitle: String(text.docTitle ?? DEFAULT_FV_YEAR_COMPARISON_TEMPLATE.text.docTitle),
      targetYearsLabel: String(text.targetYearsLabel ?? DEFAULT_FV_YEAR_COMPARISON_TEMPLATE.text.targetYearsLabel),
      badgeLabel: String(text.badgeLabel ?? DEFAULT_FV_YEAR_COMPARISON_TEMPLATE.text.badgeLabel),
      printedAtLabel: String(text.printedAtLabel ?? DEFAULT_FV_YEAR_COMPARISON_TEMPLATE.text.printedAtLabel),
    },
    layout: {
      pageMarginTopMm: Number(layout.pageMarginTopMm ?? DEFAULT_FV_YEAR_COMPARISON_TEMPLATE.layout.pageMarginTopMm),
      pageMarginSideMm: Number(layout.pageMarginSideMm ?? DEFAULT_FV_YEAR_COMPARISON_TEMPLATE.layout.pageMarginSideMm),
      pageMarginBottomMm: Number(layout.pageMarginBottomMm ?? DEFAULT_FV_YEAR_COMPARISON_TEMPLATE.layout.pageMarginBottomMm),
      orgFontPx: Number(layout.orgFontPx ?? DEFAULT_FV_YEAR_COMPARISON_TEMPLATE.layout.orgFontPx),
      titleFontPx: Number(layout.titleFontPx ?? DEFAULT_FV_YEAR_COMPARISON_TEMPLATE.layout.titleFontPx),
      metaFontPx: Number(layout.metaFontPx ?? DEFAULT_FV_YEAR_COMPARISON_TEMPLATE.layout.metaFontPx),
      badgeFontPx: Number(layout.badgeFontPx ?? DEFAULT_FV_YEAR_COMPARISON_TEMPLATE.layout.badgeFontPx),
      headerGapPx: Number(layout.headerGapPx ?? DEFAULT_FV_YEAR_COMPARISON_TEMPLATE.layout.headerGapPx),
      detailFontPx: Number(layout.detailFontPx ?? DEFAULT_FV_YEAR_COMPARISON_TEMPLATE.layout.detailFontPx),
      detailPaddingPx: Number(layout.detailPaddingPx ?? DEFAULT_FV_YEAR_COMPARISON_TEMPLATE.layout.detailPaddingPx),
    },
  };
};

const clampNumber = (value: unknown, fallback: number, min: number, max: number) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  if (parsed < min) return min;
  if (parsed > max) return max;
  return parsed;
};

export const normalizeArInvoiceSettings = (input: unknown): ArInvoiceSettings => {
  if (!isObject(input)) return DEFAULT_AR_INVOICE_SETTINGS;
  const title = String(input.title ?? DEFAULT_AR_INVOICE_SETTINGS.title).trim() || DEFAULT_AR_INVOICE_SETTINGS.title;
  const amountLabel =
    String(input.amountLabel ?? DEFAULT_AR_INVOICE_SETTINGS.amountLabel).trim() || DEFAULT_AR_INVOICE_SETTINGS.amountLabel;
  const subjectPrefix =
    String(input.subjectPrefix ?? DEFAULT_AR_INVOICE_SETTINGS.subjectPrefix).trim() || DEFAULT_AR_INVOICE_SETTINGS.subjectPrefix;
  const showBank = input.showBank === false ? false : true;
  const showNotes = input.showNotes === false ? false : true;
  const notesText = String(input.notesText ?? '').trim();
  return {
    version: 1,
    title,
    amountLabel,
    subjectPrefix,
    showBank,
    showNotes,
    notesText,
    titleFontSize: Math.round(clampNumber(input.titleFontSize, DEFAULT_AR_INVOICE_SETTINGS.titleFontSize, 10, 32)),
    bodyFontSize: Math.round(clampNumber(input.bodyFontSize, DEFAULT_AR_INVOICE_SETTINGS.bodyFontSize, 7, 14)),
    amountFontSize: Math.round(clampNumber(input.amountFontSize, DEFAULT_AR_INVOICE_SETTINGS.amountFontSize, 10, 22)),
    headerHeightMm: clampNumber(input.headerHeightMm, DEFAULT_AR_INVOICE_SETTINGS.headerHeightMm, 5, 12),
    rowHeightMm: clampNumber(input.rowHeightMm, DEFAULT_AR_INVOICE_SETTINGS.rowHeightMm, 4.5, 10),
    topMarginMm: clampNumber(input.topMarginMm, DEFAULT_AR_INVOICE_SETTINGS.topMarginMm, 8, 30),
    sideMarginMm: clampNumber(input.sideMarginMm, DEFAULT_AR_INVOICE_SETTINGS.sideMarginMm, 10, 30),
    lineWidth: clampNumber(input.lineWidth, DEFAULT_AR_INVOICE_SETTINGS.lineWidth, 0.5, 2.5),
  };
};

export const normalizeArDeliveryNoteSettings = (input: unknown): ArDeliveryNoteSettings => {
  if (!isObject(input)) return DEFAULT_AR_DELIVERY_NOTE_SETTINGS;
  const title = String(input.title ?? DEFAULT_AR_DELIVERY_NOTE_SETTINGS.title).trim() || DEFAULT_AR_DELIVERY_NOTE_SETTINGS.title;
  const issuerName = String(input.issuerName ?? '').trim();
  const issuerAddress = String(input.issuerAddress ?? '').trim();
  const issuerPhone = String(input.issuerPhone ?? '').trim();
  const footerNote = String(input.footerNote ?? '').trim();
  return {
    version: 1,
    title,
    issuerName,
    issuerAddress,
    issuerPhone,
    footerNote,
    topMarginMm: clampNumber(input.topMarginMm, DEFAULT_AR_DELIVERY_NOTE_SETTINGS.topMarginMm, 8, 30),
    leftMarginMm: clampNumber(input.leftMarginMm, DEFAULT_AR_DELIVERY_NOTE_SETTINGS.leftMarginMm, 8, 30),
  };
};

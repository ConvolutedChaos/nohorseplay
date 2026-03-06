function fr(t) {
  return t instanceof Int8Array || t instanceof Uint8Array || t instanceof Uint8ClampedArray;
}
class _r {
  fileName;
  data;
  constructor(r, e) {
    this.fileName = r, this.data = e;
  }
}
const lr = {
  XmlResourceFiles: {
    log: `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE logmap [
<!ELEMENT logmap (log)+>
<!ELEMENT log (#PCDATA)>
<!ATTLIST log events CDATA #IMPLIED>
<!ATTLIST log output CDATA #IMPLIED>
<!ATTLIST log filename CDATA #IMPLIED>
<!ATTLIST log generations CDATA #IMPLIED>
<!ATTLIST log limit CDATA #IMPLIED>
<!ATTLIST log format CDATA #IMPLIED>
]>
<logmap>
  <log events="None"/>
  <log output="Debug"/>
  <log filename="Magick-%g.log"/>
  <log generations="3"/>
  <log limit="2000"/>
  <log format="%t %r %u %v %d %c[%p]: %m/%f/%l/%d
  %e"/>
</logmap>
`,
    policy: `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE policymap [
<!ELEMENT policymap (policy)*>
<!ATTLIST policymap xmlns CDATA #FIXED "">
<!ELEMENT policy EMPTY>
<!ATTLIST policy xmlns CDATA #FIXED "">
<!ATTLIST policy domain NMTOKEN #REQUIRED>
<!ATTLIST policy name NMTOKEN #IMPLIED>
<!ATTLIST policy pattern CDATA #IMPLIED>
<!ATTLIST policy rights NMTOKEN #IMPLIED>
<!ATTLIST policy stealth NMTOKEN #IMPLIED>
<!ATTLIST policy value CDATA #IMPLIED>
]>
<policymap>
  <policy domain="cache" name="shared-secret" value="passphrase"/>
  <policy domain="coder" rights="none" pattern="EPHEMERAL" />
  <policy domain="coder" rights="none" pattern="MVG" />
  <policy domain="coder" rights="none" pattern="MSL" />
  <policy domain="path" rights="none" pattern="@*" />
  <policy domain="path" rights="none" pattern="|*" />
</policymap>
`
  }
};
class rn {
  constructor() {
    this.log = new _r("log.xml", lr.XmlResourceFiles.log), this.policy = new _r("policy.xml", lr.XmlResourceFiles.policy);
  }
  /**
   * Gets the default configuration.
   */
  static default = new rn();
  /**
   * Gets all the configuration files.
   */
  *all() {
    yield this.log, yield this.policy;
  }
  /// <summary>
  /// Gets the log configuration.
  /// </summary>
  log;
  /// <summary>
  /// Gets the policy configuration.
  /// </summary>
  policy;
}
class en {
  /**
   * Initializes a new instance of the {@link MagickDefine} class.
   * @param format
   * @param name The name of the define.
   * @param value The value of the define.
   */
  constructor(r, e, o) {
    this.format = r, this.name = e, this.value = o;
  }
  /**
   * Gets the format to set the define for.
   */
  format;
  /**
   * Gets the name of the define.
   */
  name;
  /**
   * Gets the value of the define.
   */
  value;
}
class au {
  format;
  constructor(r) {
    this.format = r;
  }
  createDefine(r, e) {
    return typeof e == "boolean" ? new en(this.format, r, e ? "true" : "false") : typeof e == "string" ? new en(this.format, r, e) : new en(this.format, r, e.toString());
  }
  hasValue(r) {
    return r != null;
  }
}
class so {
  _x;
  _y;
  _paintMethod;
  /**
   * Initializes a new instance of the {@link DrawableColor} class.
   * @param x The X coordinate.
   * @param  y The Y coordinate.
   * @param paintMethod The paint method to use.
   */
  constructor(r, e, o) {
    this._x = r, this._y = e, this._paintMethod = o;
  }
  draw(r) {
    r.color(this._x, this._y, this._paintMethod);
  }
}
class iu {
  _color;
  /**
   * Initializes a new instance of the {@link DrawableFillColor} class.
   * @param color The color to use.
   */
  constructor(r) {
    this._color = r;
  }
  draw(r) {
    r.fillColor(this._color);
  }
}
class su {
  _opacity;
  /**
   * Initializes a new instance of the {@link DrawableFillOpacity} class.
   * @param opacity The opacity.
   */
  constructor(r) {
    this._opacity = r;
  }
  draw(r) {
    r.fillOpacity(this._opacity.toDouble() / 100);
  }
}
class uu {
  _pointSize;
  /**
   * Initializes a new instance of the {@link DrawableFontPointSize} class.
   * @param pointSize The point size.
   */
  constructor(r) {
    this._pointSize = r;
  }
  draw(r) {
    r.fontPointSize(this._pointSize);
  }
}
class ou {
  /**
   * Initializes a new instance of the {@link LogEvent} class.
   * @param eventType - The type of the log message.
   * @param message - The log message.
   */
  constructor(r, e) {
    this.eventType = r, this.message = e ?? "";
  }
  /**
   * Gets the type of the log message.
   */
  eventType;
  /**
   * Gets the log message.
   */
  message;
}
var pr = /* @__PURE__ */ ((t) => (t[t.Undefined = 0] = "Undefined", t[t.Activate = 1] = "Activate", t[t.Associate = 2] = "Associate", t[t.Background = 3] = "Background", t[t.Copy = 4] = "Copy", t[t.Deactivate = 5] = "Deactivate", t[t.Discrete = 6] = "Discrete", t[t.Disassociate = 7] = "Disassociate", t[t.Extract = 8] = "Extract", t[t.Off = 9] = "Off", t[t.On = 10] = "On", t[t.Opaque = 11] = "Opaque", t[t.Remove = 12] = "Remove", t[t.Set = 13] = "Set", t[t.Shape = 14] = "Shape", t[t.Transparent = 15] = "Transparent", t[t.OffIfOpaque = 16] = "OffIfOpaque", t))(pr || {}), A = /* @__PURE__ */ ((t) => (t[t.Red = 0] = "Red", t[
  t.Cyan = 0
  /* Red */
] = "Cyan", t[
  t.Gray = 0
  /* Red */
] = "Gray", t[t.Green = 1] = "Green", t[
  t.Magenta = 1
  /* Green */
] = "Magenta", t[t.Blue = 2] = "Blue", t[
  t.Yellow = 2
  /* Blue */
] = "Yellow", t[t.Black = 3] = "Black", t[t.Alpha = 4] = "Alpha", t[t.Index = 5] = "Index", t[t.Meta0 = 10] = "Meta0", t[t.Meta1 = 11] = "Meta1", t[t.Meta2 = 12] = "Meta2", t[t.Meta3 = 13] = "Meta3", t[t.Meta4 = 14] = "Meta4", t[t.Meta5 = 15] = "Meta5", t[t.Meta6 = 16] = "Meta6", t[t.Meta7 = 17] = "Meta7", t[t.Meta8 = 18] = "Meta8", t[t.Meta9 = 19] = "Meta9", t[t.Meta10 = 20] = "Meta10", t[t.Meta11 = 21] = "Meta11", t[t.Meta12 = 22] = "Meta12", t[t.Meta13 = 23] = "Meta13", t[t.Meta14 = 24] = "Meta14", t[t.Meta15 = 25] = "Meta15", t[t.Meta16 = 26] = "Meta16", t[t.Meta17 = 27] = "Meta17", t[t.Meta18 = 28] = "Meta18", t[t.Meta19 = 29] = "Meta19", t[t.Meta20 = 30] = "Meta20", t[t.Meta21 = 31] = "Meta21", t[t.Meta22 = 32] = "Meta22", t[t.Meta23 = 33] = "Meta23", t[t.Meta24 = 34] = "Meta24", t[t.Meta25 = 35] = "Meta25", t[t.Meta26 = 36] = "Meta26", t[t.Meta27 = 37] = "Meta27", t[t.Meta28 = 38] = "Meta28", t[t.Meta29 = 39] = "Meta29", t[t.Meta30 = 40] = "Meta30", t[t.Meta31 = 41] = "Meta31", t[t.Meta32 = 42] = "Meta32", t[t.Meta33 = 43] = "Meta33", t[t.Meta34 = 44] = "Meta34", t[t.Meta35 = 45] = "Meta35", t[t.Meta36 = 46] = "Meta36", t[t.Meta37 = 47] = "Meta37", t[t.Meta38 = 48] = "Meta38", t[t.Meta39 = 49] = "Meta39", t[t.Meta40 = 50] = "Meta40", t[t.Meta41 = 51] = "Meta41", t[t.Meta42 = 52] = "Meta42", t[t.Meta43 = 53] = "Meta43", t[t.Meta44 = 54] = "Meta44", t[t.Meta45 = 55] = "Meta45", t[t.Meta46 = 56] = "Meta46", t[t.Meta47 = 57] = "Meta47", t[t.Meta48 = 58] = "Meta48", t[t.Meta49 = 59] = "Meta49", t[t.Meta50 = 60] = "Meta50", t[t.Meta51 = 61] = "Meta51", t[t.Meta52 = 62] = "Meta52", t[t.Composite = 64] = "Composite", t))(A || {}), K = ((t) => (t[t.Undefined = 0] = "Undefined", t[t.Red = 1] = "Red", t[t.Gray = 1] = "Gray", t[t.Cyan = 1] = "Cyan", t[t.Green = 2] = "Green", t[t.Magenta = 2] = "Magenta", t[t.Blue = 4] = "Blue", t[t.Yellow = 4] = "Yellow", t[t.Black = 8] = "Black", t[t.Alpha = 16] = "Alpha", t[t.Opacity = 16] = "Opacity", t[t.Index = 32] = "Index", t[t.Composite = 31] = "Composite", t[t.TrueAlpha = 256] = "TrueAlpha", t[t.RGB = 7] = "RGB", t[t.CMYK = 15] = "CMYK", t[t.CMYKA = 31] = "CMYKA", t[t.Meta0 = 1 << A.Meta0] = "Meta0", t[t.Meta1 = 1 << A.Meta1] = "Meta1", t[t.Meta2 = 1 << A.Meta2] = "Meta2", t[t.Meta3 = 1 << A.Meta3] = "Meta3", t[t.Meta4 = 1 << A.Meta4] = "Meta4", t[t.Meta5 = 1 << A.Meta5] = "Meta5", t[t.Meta6 = 1 << A.Meta6] = "Meta6", t[t.Meta7 = 1 << A.Meta7] = "Meta7", t[t.Meta8 = 1 << A.Meta8] = "Meta8", t[t.Meta9 = 1 << A.Meta9] = "Meta9", t[t.Meta10 = 1 << A.Meta10] = "Meta10", t[t.Meta11 = 1 << A.Meta11] = "Meta11", t[t.Meta12 = 1 << A.Meta12] = "Meta12", t[t.Meta13 = 1 << A.Meta13] = "Meta13", t[t.Meta14 = 1 << A.Meta14] = "Meta14", t[t.Meta15 = 1 << A.Meta15] = "Meta15", t[t.Meta16 = 1 << A.Meta16] = "Meta16", t[t.Meta17 = 1 << A.Meta17] = "Meta17", t[t.Meta18 = 1 << A.Meta18] = "Meta18", t[t.Meta19 = 1 << A.Meta19] = "Meta19", t[t.Meta20 = 1 << A.Meta20] = "Meta20", t[t.Meta21 = 1 << A.Meta21] = "Meta21", t[t.Meta22 = 1 << A.Meta22] = "Meta22", t[t.Meta23 = 1 << A.Meta23] = "Meta23", t[t.Meta24 = 1 << A.Meta24] = "Meta24", t[t.Meta25 = 1 << A.Meta25] = "Meta25", t[t.Meta26 = 1 << A.Meta26] = "Meta26", t[t.Meta27 = 1 << A.Meta27] = "Meta27", t[t.Meta28 = 1 << A.Meta28] = "Meta28", t[t.Meta29 = 1 << A.Meta29] = "Meta29", t[t.Meta30 = 1 << A.Meta30] = "Meta30", t[t.Meta31 = 1 << A.Meta31] = "Meta31", t[t.Meta32 = 1 << A.Meta32] = "Meta32", t[t.Meta33 = 1 << A.Meta33] = "Meta33", t[t.Meta34 = 1 << A.Meta34] = "Meta34", t[t.Meta35 = 1 << A.Meta35] = "Meta35", t[t.Meta36 = 1 << A.Meta36] = "Meta36", t[t.Meta37 = 1 << A.Meta37] = "Meta37", t[t.Meta38 = 1 << A.Meta38] = "Meta38", t[t.Meta39 = 1 << A.Meta39] = "Meta39", t[t.Meta40 = 1 << A.Meta40] = "Meta40", t[t.Meta41 = 1 << A.Meta41] = "Meta41", t[t.Meta42 = 1 << A.Meta42] = "Meta42", t[t.Meta43 = 1 << A.Meta43] = "Meta43", t[t.Meta44 = 1 << A.Meta44] = "Meta44", t[t.Meta45 = 1 << A.Meta45] = "Meta45", t[t.Meta46 = 1 << A.Meta46] = "Meta46", t[t.Meta47 = 1 << A.Meta47] = "Meta47", t[t.Meta48 = 1 << A.Meta48] = "Meta48", t[t.Meta49 = 1 << A.Meta49] = "Meta49", t[t.Meta50 = 1 << A.Meta50] = "Meta50", t[t.Meta51 = 1 << A.Meta51] = "Meta51", t[t.Meta52 = 1 << A.Meta52] = "Meta52", t[t.All = 134217727] = "All", t))(K || {});
class _u {
  constructor(r, e, o, g) {
    this.red = r, this.green = e, this.blue = o, this.white = g;
  }
  /**
   * Gets the chromaticity red primary point.
   */
  red;
  /**
   * Gets the chromaticity green primary point.
   */
  green;
  /**
   * Gets the chromaticity blue primary point.
   */
  blue;
  /**
   * Gets the chromaticity white primary point.
   */
  white;
}
var dt = /* @__PURE__ */ ((t) => (t[t.Undefined = 0] = "Undefined", t[t.CMY = 1] = "CMY", t[t.CMYK = 2] = "CMYK", t[t.Gray = 3] = "Gray", t[t.HCL = 4] = "HCL", t[t.HCLp = 5] = "HCLp", t[t.HSB = 6] = "HSB", t[t.HSI = 7] = "HSI", t[t.HSL = 8] = "HSL", t[t.HSV = 9] = "HSV", t[t.HWB = 10] = "HWB", t[t.Lab = 11] = "Lab", t[t.LCH = 12] = "LCH", t[t.LCHab = 13] = "LCHab", t[t.LCHuv = 14] = "LCHuv", t[t.Log = 15] = "Log", t[t.LMS = 16] = "LMS", t[t.Luv = 17] = "Luv", t[t.OHTA = 18] = "OHTA", t[t.Rec601YCbCr = 19] = "Rec601YCbCr", t[t.Rec709YCbCr = 20] = "Rec709YCbCr", t[t.RGB = 21] = "RGB", t[t.scRGB = 22] = "scRGB", t[t.sRGB = 23] = "sRGB", t[t.Transparent = 24] = "Transparent", t[t.XyY = 25] = "XyY", t[t.XYZ = 26] = "XYZ", t[t.YCbCr = 27] = "YCbCr", t[t.YCC = 28] = "YCC", t[t.YDbDr = 29] = "YDbDr", t[t.YIQ = 30] = "YIQ", t[t.YPbPr = 31] = "YPbPr", t[t.YUV = 32] = "YUV", t[t.LinearGray = 33] = "LinearGray", t))(dt || {});
class an {
  constructor(r, e) {
    this.distortion = r, this.difference = e;
  }
  /**
   * Gets the difference image.
   */
  difference;
  /**
   * Gets the distortion.
   */
  distortion;
  /** @internal */
  static _create(r, e) {
    return new an(r, e);
  }
}
class lu {
  constructor(r) {
    this.metric = r;
  }
  /**
   * Gets the distortion method to use.
   */
  metric;
  /**
   * Gets or sets the color that emphasize pixel differences.
   */
  highlightColor;
  /**
   * Gets or sets the color that de-emphasize pixel differences.
   */
  lowlightColor;
  /**
   * Gets or sets the color of pixels that are inside the read mask.
   */
  masklightColor;
  /** @internal */
  _setArtifacts(r) {
    this.highlightColor !== void 0 && r.setArtifact("compare:highlight-color", this.highlightColor), this.lowlightColor !== void 0 && r.setArtifact("compare:lowlight-color", this.lowlightColor), this.masklightColor !== void 0 && r.setArtifact("compare:masklight-color", this.masklightColor);
  }
}
var Rt = /* @__PURE__ */ ((t) => (t[t.Undefined = 0] = "Undefined", t[t.Alpha = 1] = "Alpha", t[t.Atop = 2] = "Atop", t[t.Blend = 3] = "Blend", t[t.Blur = 4] = "Blur", t[t.Bumpmap = 5] = "Bumpmap", t[t.ChangeMask = 6] = "ChangeMask", t[t.Clear = 7] = "Clear", t[t.ColorBurn = 8] = "ColorBurn", t[t.ColorDodge = 9] = "ColorDodge", t[t.Colorize = 10] = "Colorize", t[t.CopyBlack = 11] = "CopyBlack", t[t.CopyBlue = 12] = "CopyBlue", t[t.Copy = 13] = "Copy", t[t.CopyCyan = 14] = "CopyCyan", t[t.CopyGreen = 15] = "CopyGreen", t[t.CopyMagenta = 16] = "CopyMagenta", t[t.CopyAlpha = 17] = "CopyAlpha", t[t.CopyRed = 18] = "CopyRed", t[t.CopyYellow = 19] = "CopyYellow", t[t.Darken = 20] = "Darken", t[t.DarkenIntensity = 21] = "DarkenIntensity", t[t.Difference = 22] = "Difference", t[t.Displace = 23] = "Displace", t[t.Dissolve = 24] = "Dissolve", t[t.Distort = 25] = "Distort", t[t.DivideDst = 26] = "DivideDst", t[t.DivideSrc = 27] = "DivideSrc", t[t.DstAtop = 28] = "DstAtop", t[t.Dst = 29] = "Dst", t[t.DstIn = 30] = "DstIn", t[t.DstOut = 31] = "DstOut", t[t.DstOver = 32] = "DstOver", t[t.Exclusion = 33] = "Exclusion", t[t.HardLight = 34] = "HardLight", t[t.HardMix = 35] = "HardMix", t[t.Hue = 36] = "Hue", t[t.In = 37] = "In", t[t.Intensity = 38] = "Intensity", t[t.Lighten = 39] = "Lighten", t[t.LightenIntensity = 40] = "LightenIntensity", t[t.LinearBurn = 41] = "LinearBurn", t[t.LinearDodge = 42] = "LinearDodge", t[t.LinearLight = 43] = "LinearLight", t[t.Luminize = 44] = "Luminize", t[t.Mathematics = 45] = "Mathematics", t[t.MinusDst = 46] = "MinusDst", t[t.MinusSrc = 47] = "MinusSrc", t[t.Modulate = 48] = "Modulate", t[t.ModulusAdd = 49] = "ModulusAdd", t[t.ModulusSubtract = 50] = "ModulusSubtract", t[t.Multiply = 51] = "Multiply", t[t.No = 52] = "No", t[t.Out = 53] = "Out", t[t.Over = 54] = "Over", t[t.Overlay = 55] = "Overlay", t[t.PegtopLight = 56] = "PegtopLight", t[t.PinLight = 57] = "PinLight", t[t.Plus = 58] = "Plus", t[t.Replace = 59] = "Replace", t[t.Saturate = 60] = "Saturate", t[t.Screen = 61] = "Screen", t[t.SoftLight = 62] = "SoftLight", t[t.SrcAtop = 63] = "SrcAtop", t[t.Src = 64] = "Src", t[t.SrcIn = 65] = "SrcIn", t[t.SrcOut = 66] = "SrcOut", t[t.SrcOver = 67] = "SrcOver", t[t.Threshold = 68] = "Threshold", t[t.VividLight = 69] = "VividLight", t[t.Xor = 70] = "Xor", t[t.Stereo = 71] = "Stereo", t[t.Freeze = 72] = "Freeze", t[t.Interpolate = 73] = "Interpolate", t[t.Negate = 74] = "Negate", t[t.Reflect = 75] = "Reflect", t[t.SoftBurn = 76] = "SoftBurn", t[t.SoftDodge = 77] = "SoftDodge", t[t.Stamp = 78] = "Stamp", t[t.RMSE = 79] = "RMSE", t[t.SaliencyBlend = 80] = "SaliencyBlend", t[t.SeamlessBlend = 81] = "SeamlessBlend", t))(Rt || {}), Bt = /* @__PURE__ */ ((t) => (t[t.Warning = 300] = "Warning", t[t.ResourceLimitWarning = 300] = "ResourceLimitWarning", t[t.TypeWarning = 305] = "TypeWarning", t[t.OptionWarning = 310] = "OptionWarning", t[t.DelegateWarning = 315] = "DelegateWarning", t[t.MissingDelegateWarning = 320] = "MissingDelegateWarning", t[t.CorruptImageWarning = 325] = "CorruptImageWarning", t[t.FileOpenWarning = 330] = "FileOpenWarning", t[t.BlobWarning = 335] = "BlobWarning", t[t.StreamWarning = 340] = "StreamWarning", t[t.CacheWarning = 345] = "CacheWarning", t[t.CoderWarning = 350] = "CoderWarning", t[t.FilterWarning = 352] = "FilterWarning", t[t.ModuleWarning = 355] = "ModuleWarning", t[t.DrawWarning = 360] = "DrawWarning", t[t.ImageWarning = 365] = "ImageWarning", t[t.WandWarning = 370] = "WandWarning", t[t.RandomWarning = 375] = "RandomWarning", t[t.XServerWarning = 380] = "XServerWarning", t[t.MonitorWarning = 385] = "MonitorWarning", t[t.RegistryWarning = 390] = "RegistryWarning", t[t.ConfigureWarning = 395] = "ConfigureWarning", t[t.PolicyWarning = 399] = "PolicyWarning", t[t.Error = 400] = "Error", t[t.ResourceLimitError = 400] = "ResourceLimitError", t[t.TypeError = 405] = "TypeError", t[t.OptionError = 410] = "OptionError", t[t.DelegateError = 415] = "DelegateError", t[t.MissingDelegateError = 420] = "MissingDelegateError", t[t.CorruptImageError = 425] = "CorruptImageError", t[t.FileOpenError = 430] = "FileOpenError", t[t.BlobError = 435] = "BlobError", t[t.StreamError = 440] = "StreamError", t[t.CacheError = 445] = "CacheError", t[t.CoderError = 450] = "CoderError", t[t.FilterError = 452] = "FilterError", t[t.ModuleError = 455] = "ModuleError", t[t.DrawError = 460] = "DrawError", t[t.ImageError = 465] = "ImageError", t[t.WandError = 470] = "WandError", t[t.RandomError = 475] = "RandomError", t[t.XServerError = 480] = "XServerError", t[t.MonitorError = 485] = "MonitorError", t[t.RegistryError = 490] = "RegistryError", t[t.ConfigureError = 495] = "ConfigureError", t[t.PolicyError = 499] = "PolicyError", t))(Bt || {});
class Z extends Error {
  _relatedErrors = [];
  /** @internal */
  constructor(r, e = Bt.Error) {
    super(r), this.severity = e;
  }
  /**
   * Gets the severity of an exception.
   */
  severity;
  /**
   * Gets the exceptions that are related to this exception.
   */
  get relatedErrors() {
    return this._relatedErrors;
  }
  /** @internal */
  _setRelatedErrors(r) {
    this._relatedErrors = r;
  }
}
class Ue {
  /**
   * Gets the quantum depth.
   */
  static get depth() {
    return l._api._Quantum_Depth_Get();
  }
  /**
   * Gets the maximum value of the quantum.
   */
  static get max() {
    return l._api._Quantum_Max_Get();
  }
}
function ge(t) {
  return t === 0 ? null : l._api.UTF8ToString(t);
}
function tn(t, r, e) {
  const o = t.lengthBytesUTF8(r) + 1, g = t._malloc(o);
  try {
    return t.stringToUTF8(r, g, o), e(g);
  } finally {
    t._free(g);
  }
}
function L(t, r) {
  return tn(l._api, t, r);
}
class w {
  constructor(r, e, o, g, p) {
    if (r !== void 0)
      if (typeof r == "string") {
        let h = 0;
        try {
          h = l._api._MagickColor_Create(), L(r, (S) => {
            if (l._api._MagickColor_Initialize(h, S) === 0)
              throw new Z("invalid color specified");
            this.initialize(h);
          });
        } finally {
          l._api._free(h);
        }
      } else
        this.r = r, this.g = e ?? 0, this.b = o ?? 0, p === void 0 ? this.a = g ?? Ue.max : (this.k = g ?? 0, this.a = p, this.isCmyk = !0);
  }
  r = 0;
  g = 0;
  b = 0;
  a = 0;
  k = 0;
  isCmyk = !1;
  /** @internal */
  static _create(r) {
    const e = new w();
    return e.initialize(r), e;
  }
  toShortString() {
    return this.a !== Ue.max ? this.toString() : this.isCmyk ? `cmyka(${this.r},${this.g},${this.b},${this.k})` : `#${this.toHex(this.r)}${this.toHex(this.g)}${this.toHex(this.b)}`;
  }
  toString() {
    return this.isCmyk ? `cmyka(${this.r},${this.g},${this.b},${this.k},${(this.a / Ue.max).toFixed(4)})` : `#${this.toHex(this.r)}${this.toHex(this.g)}${this.toHex(this.b)}${this.toHex(this.a)}`;
  }
  /** @internal */
  _use(r) {
    let e = 0;
    try {
      e = l._api._MagickColor_Create(), l._api._MagickColor_Red_Set(e, this.r), l._api._MagickColor_Green_Set(e, this.g), l._api._MagickColor_Blue_Set(e, this.b), l._api._MagickColor_Alpha_Set(e, this.a), l._api._MagickColor_IsCMYK_Set(e, this.isCmyk ? 1 : 0), r(e);
    } finally {
      l._api._free(e);
    }
  }
  initialize(r) {
    this.r = l._api._MagickColor_Red_Get(r), this.g = l._api._MagickColor_Green_Get(r), this.b = l._api._MagickColor_Blue_Get(r), this.a = l._api._MagickColor_Alpha_Get(r), this.isCmyk = l._api._MagickColor_IsCMYK_Get(r) === 1;
  }
  toHex(r) {
    return r.toString(16).padStart(2, "0");
  }
}
var ke = /* @__PURE__ */ ((t) => (t[t.NoValue = 0] = "NoValue", t[t.PercentValue = 4096] = "PercentValue", t[t.IgnoreAspectRatio = 8192] = "IgnoreAspectRatio", t[t.Less = 16384] = "Less", t[t.Greater = 32768] = "Greater", t[t.FillArea = 65536] = "FillArea", t[t.LimitPixels = 131072] = "LimitPixels", t[t.AspectRatio = 1048576] = "AspectRatio", t))(ke || {});
class ce {
  _includeXyInToString;
  _width = 0;
  _height = 0;
  _x = 0;
  _y = 0;
  _aspectRatio = !1;
  _fillArea = !1;
  _greater = !1;
  _isPercentage = !1;
  _ignoreAspectRatio = !1;
  _less = !1;
  _limitPixels = !1;
  constructor(r, e, o, g) {
    if (typeof r == "number") {
      if (o !== void 0 && g !== void 0 ? (this._width = o, this._height = g, this._x = r, this._y = e ?? 0, this._includeXyInToString = !0) : (this._width = r, this._height = e ?? this._width, this._x = 0, this._y = 0, this._includeXyInToString = !1), this._width < 0)
        throw new Z("negative width is not allowed");
      if (this._height < 0)
        throw new Z("negative height is not allowed");
    } else {
      this._includeXyInToString = r.indexOf("+") >= 0 || r.indexOf("-") >= 0;
      const p = l._api._MagickGeometry_Create();
      try {
        L(r, (h) => {
          const S = l._api._MagickGeometry_Initialize(p, h);
          if (S === ke.NoValue)
            throw new Z("invalid geometry specified");
          this.hasFlag(S, ke.AspectRatio) ? this.initializeFromAspectRation(p, r) : this.initialize(p, S);
        });
      } finally {
        l._api._MagickGeometry_Dispose(p);
      }
    }
  }
  get aspectRatio() {
    return this._aspectRatio;
  }
  get fillArea() {
    return this._fillArea;
  }
  set fillArea(r) {
    this._fillArea = r;
  }
  get greater() {
    return this._greater;
  }
  set greater(r) {
    this._greater = r;
  }
  get height() {
    return this._height;
  }
  set height(r) {
    this._height = r;
  }
  get ignoreAspectRatio() {
    return this._ignoreAspectRatio;
  }
  set ignoreAspectRatio(r) {
    this._ignoreAspectRatio = r;
  }
  get isPercentage() {
    return this._isPercentage;
  }
  set isPercentage(r) {
    this._isPercentage = r;
  }
  get less() {
    return this._less;
  }
  set less(r) {
    this._less = r;
  }
  get limitPixels() {
    return this._limitPixels;
  }
  set limitPixels(r) {
    this._limitPixels = r;
  }
  get width() {
    return this._width;
  }
  set width(r) {
    this._width = r;
  }
  get x() {
    return this._x;
  }
  set x(r) {
    this._x = r;
  }
  get y() {
    return this._y;
  }
  set y(r) {
    this._y = r;
  }
  toString() {
    if (this._aspectRatio)
      return this._width + ":" + this._height;
    let r = "";
    return this._width == 0 && this._height == 0 ? r += "0x0" : (this._width > 0 && (r += this._width.toString()), this._height > 0 ? r += "x" + this._height.toString() : r += "x"), (this._x != 0 || this._y != 0 || this._includeXyInToString) && (this._x >= 0 && (r += "+"), r += this._x, this.y >= 0 && (r += "+"), r += this.y), this._fillArea && (r += "^"), this._greater && (r += ">"), this._isPercentage && (r += "%"), this._ignoreAspectRatio && (r += "!"), this._less && (r += "<"), this._limitPixels && (r += "@"), r;
  }
  /** @internal */
  static _fromRectangle(r) {
    if (r === 0)
      throw new Z("unable to allocate memory");
    try {
      const e = l._api._MagickRectangle_Width_Get(r), o = l._api._MagickRectangle_Height_Get(r), g = l._api._MagickRectangle_X_Get(r), p = l._api._MagickRectangle_Y_Get(r);
      return new ce(g, p, e, o);
    } finally {
      l._api._MagickRectangle_Dispose(r);
    }
  }
  /** @internal */
  _toRectangle(r) {
    const e = l._api._MagickRectangle_Create();
    if (e === 0)
      throw new Z("unable to allocate memory");
    try {
      l._api._MagickRectangle_Width_Set(e, this._width), l._api._MagickRectangle_Height_Set(e, this._height), l._api._MagickRectangle_X_Set(e, this._x), l._api._MagickRectangle_Y_Set(e, this._y), r(e);
    } finally {
      l._api._MagickRectangle_Dispose(e);
    }
  }
  initialize(r, e) {
    this._width = l._api._MagickGeometry_Width_Get(r), this._height = l._api._MagickGeometry_Height_Get(r), this._x = l._api._MagickGeometry_X_Get(r), this._y = l._api._MagickGeometry_Y_Get(r), this._ignoreAspectRatio = this.hasFlag(e, ke.IgnoreAspectRatio), this._isPercentage = this.hasFlag(e, ke.PercentValue), this._fillArea = this.hasFlag(e, ke.FillArea), this._greater = this.hasFlag(e, ke.Greater), this._less = this.hasFlag(e, ke.Less), this._limitPixels = this.hasFlag(e, ke.LimitPixels);
  }
  initializeFromAspectRation(r, e) {
    this._aspectRatio = !0;
    const o = e.split(":");
    this._width = this.parseNumber(o[0]), this._height = this.parseNumber(o[1]), this._x = l._api._MagickGeometry_X_Get(r), this._y = l._api._MagickGeometry_Y_Get(r);
  }
  parseNumber(r) {
    let e = 0;
    for (; e < r.length && !this.isNumber(r[e]); )
      e++;
    const o = e;
    for (; e < r.length && this.isNumber(r[e]); )
      e++;
    return parseInt(r.substr(o, e - o));
  }
  isNumber(r) {
    return r >= "0" && r <= "9";
  }
  hasFlag(r, e) {
    return (r & e) === e;
  }
}
class ve {
  constructor(r, e) {
    this.x = r, this.y = e ?? r;
  }
  /**
   * Gets the x-coordinate of this point.
   */
  x;
  /**
   * Gets the y-coordinate of this point.
   */
  y;
  /** @internal */
  static _create(r) {
    return r === 0 ? new ve(0, 0) : new ve(l._api._PointInfo_X_Get(r), l._api._PointInfo_Y_Get(r));
  }
}
class sn {
  constructor(r) {
    this.area = l._api._ConnectedComponent_GetArea(r), this.centroid = ve._create(l._api._ConnectedComponent_GetCentroid(r)), this.color = w._create(l._api._ConnectedComponent_GetColor(r)), this.height = l._api._ConnectedComponent_GetHeight(r), this.id = l._api._ConnectedComponent_GetId(r), this.width = l._api._ConnectedComponent_GetWidth(r), this.x = l._api._ConnectedComponent_GetX(r), this.y = l._api._ConnectedComponent_GetY(r);
  }
  /**
   * The pixel count of the area.
   */
  area;
  /**
   * The centroid of the area.
   */
  centroid;
  /**
   * The color of the area.
   */
  color;
  /**
   * The height of the area.
   */
  height;
  /**
   * The id of the area.
   */
  id;
  /**
   * The width of the area.
   */
  width;
  /**
   * The X offset from origin.
   */
  x;
  /**
   * The Y offset from origin.
   */
  y;
  /** @internal */
  static _create(r, e) {
    const o = [];
    if (r === 0)
      return o;
    for (let g = 0; g < e; g++) {
      const p = l._api._ConnectedComponent_GetInstance(r, g);
      p === 0 || l._api._ConnectedComponent_GetArea(p) < Number.EPSILON || o.push(new sn(p));
    }
    return o;
  }
  /**
   * Returns the geometry of the area of the connected component.
   */
  toGeometry() {
    return new ce(this.x, this.y, this.width, this.height);
  }
}
class cu {
  /**
   * The threshold that merges any object not within the min and max angle
   * threshold.
   **/
  angleThreshold;
  /**
   * The threshold that eliminates small objects by merging them with their
   * larger neighbors.
   */
  areaThreshold;
  /**
   * The threshold that merges any object not within the min and max
   * circularity threshold.
   */
  circularityThreshold;
  /**
   * The number of neighbors to visit (4 or 8).
   */
  connectivity;
  /**
   * The threshold that merges any object not within the min and max diameter
   * threshold.
   */
  diameterThreshold;
  /**
   * The threshold that merges any object not within the min and max
   * eccentricity threshold.
   */
  eccentricityThreshold;
  /**
   * The threshold that merges any object not within the min and max ellipse
   * major threshold.
   */
  majorAxisThreshold;
  /**
   * Whether the object color in the component labeled image will be replaced
   * with the mean color from the source image (defaults to grayscale).
   */
  meanColor;
  /**
   * The threshold that merges any object not within the min and max ellipse
   * minor threshold.
   */
  minorAxisThreshold;
  /**
   * The threshold that merges any object not within the min and max perimeter
   * threshold.
   */
  perimeterThreshold;
  constructor(r) {
    this.connectivity = r;
  }
  /** @internal */
  _setArtifacts(r) {
    this.angleThreshold !== void 0 && r.setArtifact("connected-components:angle-threshold", this.angleThreshold.toString()), this.areaThreshold !== void 0 && r.setArtifact("connected-components:area-threshold", this.areaThreshold.toString()), this.circularityThreshold !== void 0 && r.setArtifact("connected-components:circularity-threshold", this.circularityThreshold.toString()), this.diameterThreshold !== void 0 && r.setArtifact("connected-components:diameter-threshold", this.diameterThreshold.toString()), this.eccentricityThreshold !== void 0 && r.setArtifact("connected-components:eccentricity-threshold", this.eccentricityThreshold.toString()), this.majorAxisThreshold !== void 0 && r.setArtifact("connected-components:major-axis-threshold", this.majorAxisThreshold.toString()), this.meanColor !== void 0 && r.setArtifact("connected-components:mean-color", this.meanColor.toString()), this.minorAxisThreshold !== void 0 && r.setArtifact("connected-components:minor-axis-threshold", this.minorAxisThreshold.toString()), this.perimeterThreshold !== void 0 && r.setArtifact("connected-components:perimeter-threshold", this.perimeterThreshold.toString());
  }
}
var dr = /* @__PURE__ */ ((t) => (t[t.Undefined = 0] = "Undefined", t[t.PixelsPerInch = 1] = "PixelsPerInch", t[t.PixelsPerCentimeter = 2] = "PixelsPerCentimeter", t))(dr || {});
class hr {
  constructor(r, e, o) {
    e === void 0 ? (this.x = r, this.y = r, this.units = dr.PixelsPerInch) : o !== void 0 ? (this.x = r, this.y = e, this.units = o) : (this.x = r, this.y = r, this.units = e);
  }
  /**
   * Gets the x resolution.
   */
  x;
  /**
   * Gets the y resolution.
   */
  y;
  /**
   * Gets the units.
   */
  units;
}
class _e {
  static _disposeAfterExecution(r, e) {
    try {
      const o = e(r);
      return o instanceof Promise ? Promise.resolve(o).then((g) => (r.dispose(), _e.checkResult(r, g), g)) : (r.dispose(), _e.checkResult(r, o), o);
    } catch (o) {
      throw r.dispose(), o;
    }
  }
  static checkResult(r, e) {
    if (e === r)
      throw new Z("The result of the function cannot be the instance that has been disposed.");
    return e;
  }
}
class yr {
  _pointer;
  _bytes;
  _func;
  constructor(r, e, o) {
    this._pointer = r, this._func = o, this._bytes = l._api.HEAPU8.subarray(r, r + e);
  }
  func(r) {
    return r._bytes === void 0 ? r._func(new Uint8Array()) : r._func(r._bytes);
  }
  dispose() {
    this._pointer = l._api._MagickMemory_Relinquish(this._pointer);
  }
}
class Fe {
  disposeMethod;
  instance;
  /** @internal */
  constructor(r, e) {
    this.instance = r, this.disposeMethod = e;
  }
  /** @internal */
  get _instance() {
    if (this.instance > 0)
      return this.instance;
    throw this.instance === -1 && this._instanceNotInitialized(), new Z("instance is disposed");
  }
  /** @internal */
  set _instance(r) {
    this.disposeInstance(this.instance), this.instance = r;
  }
  dispose() {
    this.instance = this.disposeInstance(this.instance);
  }
  /** @internal */
  _instanceNotInitialized() {
    throw new Z("instance is not initialized");
  }
  /** @internal */
  _setInstance(r, e) {
    return e.check(() => this.instance === 0 ? !1 : (this.dispose(), this.instance = r, !0), () => (this.disposeInstance(r), !0));
  }
  disposeInstance(r) {
    return r > 0 && (this.onDispose !== void 0 && this.onDispose(), this.disposeMethod(r)), 0;
  }
}
class gu extends Fe {
  constructor(r) {
    const e = l._api._DrawingSettings_Create(), o = l._api._DrawingSettings_Dispose;
    if (super(e, o), r.fillColor !== void 0 && r.fillColor._use((g) => {
      l._api._DrawingSettings_FillColor_Set(this._instance, g);
    }), r.font !== void 0) {
      const g = De._getFontFileName(r.font);
      L(g, (p) => {
        l._api._DrawingSettings_Font_Set(this._instance, p);
      });
    }
    r.fontPointsize !== void 0 && l._api._DrawingSettings_FontPointsize_Set(this._instance, r.fontPointsize), r.strokeColor !== void 0 && r.strokeColor._use((g) => {
      l._api._DrawingSettings_StrokeColor_Set(this._instance, g);
    }), r.strokeWidth !== void 0 && l._api._DrawingSettings_StrokeWidth_Set(this._instance, r.strokeWidth);
  }
}
class un {
  backgroundColor;
  fillColor;
  font;
  fontPointsize;
  strokeColor;
  strokeWidth;
  static _create(r) {
    const e = new un();
    return e.fillColor = r.fillColor, e.font = r.font, e.fontPointsize = r.fontPointsize, e.strokeColor = r.strokeColor, e.strokeWidth = r.strokeWidth, e;
  }
  _use(r) {
    const e = new gu(this);
    return _e._disposeAfterExecution(e, r);
  }
}
class wr {
  instance;
  type;
  constructor(r, e) {
    this.instance = l._api._malloc(r), this.type = e, l._api.setValue(this.instance, 0, this.type);
  }
  get ptr() {
    return this.instance;
  }
  get value() {
    return l._api.getValue(this.instance, this.type);
  }
}
class Ge extends wr {
  constructor() {
    super(4, "i32");
  }
  static use(r) {
    const e = new Ge();
    try {
      return r(e);
    } finally {
      l._api._free(e.ptr);
    }
  }
}
class T {
  pointer;
  constructor(r) {
    this.pointer = r;
  }
  get ptr() {
    return this.pointer.ptr;
  }
  check(r, e) {
    return this.isError() ? e() : r();
  }
  static usePointer(r, e) {
    return Ge.use((o) => {
      const g = r(o.ptr);
      return T.checkException(o, g, e);
    });
  }
  static use(r, e) {
    return Ge.use((o) => {
      const g = r(new T(o));
      return T.checkException(o, g, e);
    });
  }
  static checkException(r, e, o) {
    if (!T.isRaised(r))
      return e;
    const g = T.getErrorSeverity(r.value);
    if (g >= Bt.Error)
      T.throw(r, g);
    else if (o !== void 0) {
      const p = T.createError(r.value, g);
      o(p);
    } else
      T.dispose(r);
    return e;
  }
  isError() {
    return T.isRaised(this.pointer) ? T.getErrorSeverity(this.pointer.value) >= Bt.Error : !1;
  }
  static getErrorSeverity(r) {
    return l._api._MagickExceptionHelper_Severity(r);
  }
  static isRaised(r) {
    return r.value !== 0;
  }
  static throw(r, e) {
    const o = T.createError(r.value, e);
    throw T.dispose(r), o;
  }
  static createError(r, e) {
    const o = T.getMessage(r), g = new Z(o, e), p = l._api._MagickExceptionHelper_RelatedCount(r);
    if (p === 0)
      return g;
    const h = [];
    for (let S = 0; S < p; S++) {
      const G = l._api._MagickExceptionHelper_Related(r, S), C = T.getErrorSeverity(G), x = T.createError(G, C);
      h.push(x);
    }
    return g._setRelatedErrors(h), g;
  }
  static getMessage(r) {
    const e = l._api._MagickExceptionHelper_Message(r), o = l._api._MagickExceptionHelper_Description(r);
    let g = ge(e);
    return o !== 0 && (g += `(${l._api.UTF8ToString(o)})`), g;
  }
  static dispose(r) {
    l._api._MagickExceptionHelper_Dispose(r.value);
  }
}
class on {
  constructor(r, e, o, g, p, h, S) {
    this.ascent = r, this.descent = e, this.maxHorizontalAdvance = o, this.textHeight = g, this.textWidth = p, this.underlinePosition = h, this.underlineThickness = S;
  }
  /**
   * Gets the ascent, the distance in pixels from the text baseline to the highest/upper grid coordinate
   * used to place an outline point.
   */
  ascent;
  /**
   * Gets the descent, the distance in pixels from the baseline to the lowest grid coordinate used to
   * place an outline point. Always a negative value.
   */
  descent;
  /**
   * Gets the maximum horizontal advance in pixels.
   */
  maxHorizontalAdvance;
  /**
   * Gets the text height in pixels.
   */
  textHeight;
  /**
   * Gets the text width in pixels.
   */
  textWidth;
  /**
   * Gets the underline position.
   */
  underlinePosition;
  /**
   * Gets the underline thickness.
   */
  underlineThickness;
  /** @internal */
  static _create(r) {
    if (r == 0)
      return null;
    try {
      const e = l._api._TypeMetric_Ascent_Get(r), o = l._api._TypeMetric_Descent_Get(r), g = l._api._TypeMetric_MaxHorizontalAdvance_Get(r), p = l._api._TypeMetric_TextHeight_Get(r), h = l._api._TypeMetric_TextWidth_Get(r), S = l._api._TypeMetric_UnderlinePosition_Get(r), G = l._api._TypeMetric_UnderlineThickness_Get(r);
      return new on(e, o, g, p, h, S, G);
    } finally {
      l._api._TypeMetric_Dispose(r);
    }
  }
}
class Lt extends Fe {
  constructor(r, e) {
    const g = un._create(e)._use((h) => l._api._DrawingWand_Create(r._instance, h._instance)), p = l._api._DrawingWand_Dispose;
    super(g, p);
  }
  color(r, e, o) {
    T.usePointer((g) => {
      l._api._DrawingWand_Color(this._instance, r, e, o, g);
    });
  }
  draw(r) {
    r.forEach((e) => {
      e.draw(this);
    }), T.usePointer((e) => {
      l._api._DrawingWand_Render(this._instance, e);
    });
  }
  fillColor(r) {
    T.usePointer((e) => {
      r._use((o) => {
        l._api._DrawingWand_FillColor(this._instance, o, e);
      });
    });
  }
  fillOpacity(r) {
    T.usePointer((e) => {
      l._api._DrawingWand_FillOpacity(this._instance, r, e);
    });
  }
  font(r) {
    T.usePointer((e) => {
      L(r, (o) => {
        l._api._DrawingWand_Font(this._instance, o, e);
      });
    });
  }
  fontPointSize(r) {
    T.usePointer((e) => {
      l._api._DrawingWand_FontPointSize(this._instance, r, e);
    });
  }
  /** @internal */
  fontTypeMetrics(r, e) {
    return T.usePointer((o) => L(r, (g) => {
      const p = l._api._DrawingWand_FontTypeMetrics(this._instance, g, e ? 1 : 0, o);
      return on._create(p);
    }));
  }
  gravity(r) {
    T.usePointer((e) => {
      l._api._DrawingWand_Gravity(this._instance, r, e);
    });
  }
  line(r, e, o, g) {
    T.usePointer((p) => {
      l._api._DrawingWand_Line(this._instance, r, e, o, g, p);
    });
  }
  point(r, e) {
    T.usePointer((o) => {
      l._api._DrawingWand_Point(this._instance, r, e, o);
    });
  }
  rectangle(r, e, o, g) {
    T.usePointer((p) => {
      l._api._DrawingWand_Rectangle(this._instance, r, e, o, g, p);
    });
  }
  roundRectangle(r, e, o, g, p, h) {
    T.usePointer((S) => {
      l._api._DrawingWand_RoundRectangle(this._instance, r, e, o, g, p, h, S);
    });
  }
  strokeColor(r) {
    T.usePointer((e) => {
      r._use((o) => {
        l._api._DrawingWand_StrokeColor(this._instance, o, e);
      });
    });
  }
  strokeWidth(r) {
    T.usePointer((e) => {
      l._api._DrawingWand_StrokeWidth(this._instance, r, e);
    });
  }
  text(r, e, o) {
    T.usePointer((g) => {
      L(o, (p) => {
        l._api._DrawingWand_Text(this._instance, r, e, p, g);
      });
    });
  }
  textAlignment(r) {
    T.usePointer((e) => {
      l._api._DrawingWand_TextAlignment(this._instance, r, e);
    });
  }
  textAntialias(r) {
    T.usePointer((e) => {
      l._api._DrawingWand_TextAntialias(this._instance, r ? 1 : 0, e);
    });
  }
  textDecoration(r) {
    T.usePointer((e) => {
      l._api._DrawingWand_TextDecoration(this._instance, r, e);
    });
  }
  textInterlineSpacing(r) {
    T.usePointer((e) => {
      l._api._DrawingWand_TextInterlineSpacing(this._instance, r, e);
    });
  }
  textInterwordspacing(r) {
    T.usePointer((e) => {
      l._api._DrawingWand_TextInterwordSpacing(this._instance, r, e);
    });
  }
  textKerning(r) {
    T.usePointer((e) => {
      l._api._DrawingWand_TextKerning(this._instance, r, e);
    });
  }
  textUnderColor(r) {
    T.usePointer((e) => {
      r._use((o) => {
        l._api._DrawingWand_TextUnderColor(this._instance, o, e);
      });
    });
  }
  /** @internal */
  static _use(r, e) {
    const o = new Lt(r, r.settings);
    return _e._disposeAfterExecution(o, e);
  }
}
class _n extends wr {
  constructor() {
    super(8, "double");
  }
  static use(r) {
    const e = new _n();
    try {
      return r(e);
    } finally {
      l._api._free(e.ptr);
    }
  }
}
var Ct = /* @__PURE__ */ ((t) => (t[t.Undefined = 0] = "Undefined", t[t.Forget = 0] = "Forget", t[t.Northwest = 1] = "Northwest", t[t.North = 2] = "North", t[t.Northeast = 3] = "Northeast", t[t.West = 4] = "West", t[t.Center = 5] = "Center", t[t.East = 6] = "East", t[t.Southwest = 7] = "Southwest", t[t.South = 8] = "South", t[t.Southeast = 9] = "Southeast", t))(Ct || {});
function* mu(t) {
  for (const r of t)
    switch (r) {
      case 2:
        yield "north";
        break;
      case 3:
        yield "north", yield "east";
        break;
      case 1:
        yield "north", yield "west";
        break;
      case 6:
        yield "east";
        break;
      case 4:
        yield "west";
        break;
      case 8:
        yield "south";
        break;
      case 9:
        yield "south", yield "east";
        break;
      case 7:
        yield "south", yield "west";
    }
}
class fu {
  constructor(r, e) {
    this.name = r, this.data = e;
  }
  name;
  data;
}
class xt {
  constructor(r, e, o) {
    this.meanErrorPerPixel = r, this.normalizedMeanError = e, this.normalizedMaximumError = o;
  }
  /**
   * Gets the mean error per pixel computed when an image is color reduced.
   */
  meanErrorPerPixel;
  /**
   * Gets the normalized maximum error per pixel computed when an image is color reduced.
   */
  normalizedMaximumError;
  /**
   * Gets the normalized mean error per pixel computed when an image is color reduced.
   */
  normalizedMeanError;
  /** @internal */
  static _create(r) {
    const e = l._api._MagickImage_MeanErrorPerPixel_Get(r._instance), o = l._api._MagickImage_NormalizedMeanError_Get(r._instance), g = l._api._MagickImage_NormalizedMaximumError_Get(r._instance);
    return new xt(e, o, g);
  }
}
var be = /* @__PURE__ */ ((t) => (t.Unknown = "UNKNOWN", t.ThreeFr = "3FR", t.ThreeG2 = "3G2", t.ThreeGp = "3GP", t.A = "A", t.Aai = "AAI", t.Ai = "AI", t.APng = "APNG", t.Art = "ART", t.Arw = "ARW", t.Ashlar = "ASHLAR", t.Avi = "AVI", t.Avif = "AVIF", t.Avs = "AVS", t.B = "B", t.Bayer = "BAYER", t.Bayera = "BAYERA", t.Bgr = "BGR", t.Bgra = "BGRA", t.Bgro = "BGRO", t.Bmp = "BMP", t.Bmp2 = "BMP2", t.Bmp3 = "BMP3", t.Brf = "BRF", t.C = "C", t.Cal = "CAL", t.Cals = "CALS", t.Canvas = "CANVAS", t.Caption = "CAPTION", t.Cin = "CIN", t.Cip = "CIP", t.Clip = "CLIP", t.Cmyk = "CMYK", t.Cmyka = "CMYKA", t.Cr2 = "CR2", t.Cr3 = "CR3", t.Crw = "CRW", t.Cube = "CUBE", t.Cur = "CUR", t.Cut = "CUT", t.Data = "DATA", t.Dcm = "DCM", t.Dcr = "DCR", t.Dcraw = "DCRAW", t.Dcx = "DCX", t.Dds = "DDS", t.Dfont = "DFONT", t.Dng = "DNG", t.Dpx = "DPX", t.Dxt1 = "DXT1", t.Dxt5 = "DXT5", t.Epdf = "EPDF", t.Epi = "EPI", t.Eps = "EPS", t.Eps2 = "EPS2", t.Eps3 = "EPS3", t.Epsf = "EPSF", t.Epsi = "EPSI", t.Ept = "EPT", t.Ept2 = "EPT2", t.Ept3 = "EPT3", t.Erf = "ERF", t.Exr = "EXR", t.Farbfeld = "FARBFELD", t.Fax = "FAX", t.Ff = "FF", t.Fff = "FFF", t.File = "FILE", t.Fits = "FITS", t.Fl32 = "FL32", t.Flv = "FLV", t.Fractal = "FRACTAL", t.Ftp = "FTP", t.Fts = "FTS", t.Ftxt = "FTXT", t.G = "G", t.G3 = "G3", t.G4 = "G4", t.Gif = "GIF", t.Gif87 = "GIF87", t.Gradient = "GRADIENT", t.Gray = "GRAY", t.Graya = "GRAYA", t.Group4 = "GROUP4", t.Hald = "HALD", t.Hdr = "HDR", t.Heic = "HEIC", t.Heif = "HEIF", t.Histogram = "HISTOGRAM", t.Hrz = "HRZ", t.Htm = "HTM", t.Html = "HTML", t.Http = "HTTP", t.Https = "HTTPS", t.Icb = "ICB", t.Ico = "ICO", t.Icon = "ICON", t.Iiq = "IIQ", t.Info = "INFO", t.Inline = "INLINE", t.Ipl = "IPL", t.Isobrl = "ISOBRL", t.Isobrl6 = "ISOBRL6", t.J2c = "J2C", t.J2k = "J2K", t.Jng = "JNG", t.Jnx = "JNX", t.Jp2 = "JP2", t.Jpc = "JPC", t.Jpe = "JPE", t.Jpeg = "JPEG", t.Jpg = "JPG", t.Jpm = "JPM", t.Jps = "JPS", t.Jpt = "JPT", t.Json = "JSON", t.Jxl = "JXL", t.K = "K", t.K25 = "K25", t.Kdc = "KDC", t.Label = "LABEL", t.M = "M", t.M2v = "M2V", t.M4v = "M4V", t.Mac = "MAC", t.Map = "MAP", t.Mask = "MASK", t.Mat = "MAT", t.Matte = "MATTE", t.Mdc = "MDC", t.Mef = "MEF", t.Miff = "MIFF", t.Mkv = "MKV", t.Mng = "MNG", t.Mono = "MONO", t.Mov = "MOV", t.Mos = "MOS", t.Mp4 = "MP4", t.Mpc = "MPC", t.Mpeg = "MPEG", t.Mpg = "MPG", t.Mpo = "MPO", t.Mrw = "MRW", t.Msl = "MSL", t.Msvg = "MSVG", t.Mtv = "MTV", t.Mvg = "MVG", t.Nef = "NEF", t.Nrw = "NRW", t.Null = "NULL", t.O = "O", t.Ora = "ORA", t.Orf = "ORF", t.Otb = "OTB", t.Otf = "OTF", t.Pal = "PAL", t.Palm = "PALM", t.Pam = "PAM", t.Pango = "PANGO", t.Pattern = "PATTERN", t.Pbm = "PBM", t.Pcd = "PCD", t.Pcds = "PCDS", t.Pcl = "PCL", t.Pct = "PCT", t.Pcx = "PCX", t.Pdb = "PDB", t.Pdf = "PDF", t.Pdfa = "PDFA", t.Pef = "PEF", t.Pes = "PES", t.Pfa = "PFA", t.Pfb = "PFB", t.Pfm = "PFM", t.Pgm = "PGM", t.Pgx = "PGX", t.Phm = "PHM", t.Picon = "PICON", t.Pict = "PICT", t.Pix = "PIX", t.Pjpeg = "PJPEG", t.Plasma = "PLASMA", t.Png = "PNG", t.Png00 = "PNG00", t.Png24 = "PNG24", t.Png32 = "PNG32", t.Png48 = "PNG48", t.Png64 = "PNG64", t.Png8 = "PNG8", t.Pnm = "PNM", t.Pocketmod = "POCKETMOD", t.Ppm = "PPM", t.Ps = "PS", t.Ps2 = "PS2", t.Ps3 = "PS3", t.Psb = "PSB", t.Psd = "PSD", t.Ptif = "PTIF", t.Pwp = "PWP", t.Qoi = "QOI", t.R = "R", t.RadialGradient = "RADIAL-GRADIENT", t.Raf = "RAF", t.Ras = "RAS", t.Raw = "RAW", t.Rgb = "RGB", t.Rgb565 = "RGB565", t.Rgba = "RGBA", t.Rgbo = "RGBO", t.Rgf = "RGF", t.Rla = "RLA", t.Rle = "RLE", t.Rmf = "RMF", t.Rw2 = "RW2", t.Rwl = "RWL", t.Scr = "SCR", t.Screenshot = "SCREENSHOT", t.Sct = "SCT", t.Sfw = "SFW", t.Sgi = "SGI", t.Shtml = "SHTML", t.Six = "SIX", t.Sixel = "SIXEL", t.SparseColor = "SPARSE-COLOR", t.Sr2 = "SR2", t.Srf = "SRF", t.Srw = "SRW", t.Stegano = "STEGANO", t.Sti = "STI", t.StrImg = "STRIMG", t.Sun = "SUN", t.Svg = "SVG", t.Svgz = "SVGZ", t.Text = "TEXT", t.Tga = "TGA", t.Thumbnail = "THUMBNAIL", t.Tif = "TIF", t.Tiff = "TIFF", t.Tiff64 = "TIFF64", t.Tile = "TILE", t.Tim = "TIM", t.Tm2 = "TM2", t.Ttc = "TTC", t.Ttf = "TTF", t.Txt = "TXT", t.Ubrl = "UBRL", t.Ubrl6 = "UBRL6", t.Uil = "UIL", t.Uyvy = "UYVY", t.Vda = "VDA", t.Vicar = "VICAR", t.Vid = "VID", t.Viff = "VIFF", t.Vips = "VIPS", t.Vst = "VST", t.WebM = "WEBM", t.WebP = "WEBP", t.Wbmp = "WBMP", t.Wmv = "WMV", t.Wpg = "WPG", t.X3f = "X3F", t.Xbm = "XBM", t.Xc = "XC", t.Xcf = "XCF", t.Xpm = "XPM", t.Xps = "XPS", t.Xv = "XV", t.Y = "Y", t.Yaml = "YAML", t.Ycbcr = "YCBCR", t.Ycbcra = "YCBCRA", t.Yuv = "YUV", t))(be || {}), mt = /* @__PURE__ */ ((t) => (t[t.Undefined = 0] = "Undefined", t[t.Coalesce = 1] = "Coalesce", t[t.CompareAny = 2] = "CompareAny", t[t.CompareClear = 3] = "CompareClear", t[t.CompareOverlay = 4] = "CompareOverlay", t[t.Dispose = 5] = "Dispose", t[t.Optimize = 6] = "Optimize", t[t.OptimizeImage = 7] = "OptimizeImage", t[t.OptimizePlus = 8] = "OptimizePlus", t[t.OptimizeTrans = 9] = "OptimizeTrans", t[t.RemoveDups = 10] = "RemoveDups", t[t.RemoveZero = 11] = "RemoveZero", t[t.Composite = 12] = "Composite", t[t.Merge = 13] = "Merge", t[t.Flatten = 14] = "Flatten", t[t.Mosaic = 15] = "Mosaic", t[t.Trimbounds = 16] = "Trimbounds", t))(mt || {});
class Sr extends Fe {
  constructor(r) {
    const e = l._api._MagickSettings_Create(), o = l._api._MagickSettings_Dispose;
    if (super(e, o), r._fileName !== void 0 && L(r._fileName, (g) => {
      l._api._MagickSettings_SetFileName(this._instance, g);
    }), r._ping && l._api._MagickSettings_SetPing(this._instance, 1), r._quality !== void 0 && l._api._MagickSettings_SetQuality(this._instance, r._quality), r.antiAlias !== void 0 && l._api._MagickSettings_AntiAlias_Set(this._instance, r.antiAlias ? 1 : 0), r.backgroundColor !== void 0 && r.backgroundColor._use((g) => {
      l._api._MagickSettings_BackgroundColor_Set(this._instance, g);
    }), r.colorSpace !== void 0 && l._api._MagickSettings_ColorSpace_Set(this._instance, r.colorSpace), r.colorType !== void 0 && l._api._MagickSettings_ColorType_Set(this._instance, r.colorType), r.compression !== void 0 && l._api._MagickSettings_Compression_Set(this._instance, r.compression), r.debug !== void 0 && l._api._MagickSettings_Debug_Set(this._instance, r.debug ? 1 : 0), r.depth !== void 0 && l._api._MagickSettings_Depth_Set(this._instance, r.depth), r.endian !== void 0 && l._api._MagickSettings_Endian_Set(this._instance, r.endian), r.fillColor !== void 0 && this.setOption("fill", r.fillColor.toString()), r.font !== void 0) {
      const g = De._getFontFileName(r.font);
      L(g, (p) => {
        l._api._MagickSettings_SetFont(this._instance, p);
      });
    }
    r.fontPointsize !== void 0 && l._api._MagickSettings_FontPointsize_Set(this._instance, r.fontPointsize), r.format !== void 0 && L(r.format, (g) => {
      l._api._MagickSettings_Format_Set(this._instance, g);
    }), r.interlace !== void 0 && l._api._MagickSettings_Interlace_Set(this._instance, r.interlace), r.strokeColor !== void 0 && this.setOption("stroke", r.strokeColor.toString()), r.strokeWidth !== void 0 && this.setOption("strokeWidth", r.strokeWidth.toString()), r.textInterlineSpacing !== void 0 && this.setOption("interline-spacing", r.textInterlineSpacing.toString()), r.textKerning !== void 0 && this.setOption("kerning", r.textKerning.toString());
    for (const g in r._options)
      this.setOption(g, r._options[g]);
  }
  setOption(r, e) {
    L(r, (o) => {
      L(e, (g) => {
        l._api._MagickSettings_SetOption(this._instance, o, g);
      });
    });
  }
}
class ft {
  /** @internal */
  _options = {};
  /** @internal */
  _fileName;
  /** @internal */
  _ping = !1;
  /** @internal */
  _quality;
  /**
   * Gets or sets a value indicating whether anti-aliasing should be enabled (default true).
   */
  antiAlias;
  /**
   * Gets or sets the background color.
   */
  backgroundColor;
  /**
   * Gets or sets the color space.
   */
  colorSpace;
  /**
   * Gets or sets the color type of the image.
   */
  colorType;
  /**
   * Gets or sets the compression method to use.
   */
  compression;
  /**
   * Gets or sets a value indicating whether printing of debug messages from ImageMagick is enabled when a debugger is attached.
   */
  debug;
  /**
   * Gets or sets the depth (bits allocated to red/green/blue components).
   */
  depth;
  /**
   * Gets or sets the endianness (little like Intel or big like SPARC) for image formats which support
   * endian-specific options.
   */
  endian;
  /**
   * Gets or sets the fill color.
   */
  fillColor;
  /**
   * Gets or sets the text rendering font.
   */
  font;
  /**
   * Gets or sets the font point size.
   */
  fontPointsize;
  /**
   * Gets or sets the the format of the image.
   */
  format;
  /**
   * Gets or sets the interlace method.
   */
  interlace;
  /**
   * Gets or sets the color to use when drawing object outlines.
   */
  strokeColor;
  /**
   * Gets or sets the stroke width for drawing lines, circles, ellipses, etc.
   */
  strokeWidth;
  /**
   * Gets or sets the text inter-line spacing.
   */
  textInterlineSpacing;
  /**
   * Gets or sets the text inter-character kerning.
   */
  textKerning;
  getDefine(r, e) {
    return e !== void 0 ? this._options[`${r}:${e}`] ?? null : this._options[r] ?? null;
  }
  setDefine(r, e, o) {
    if (o === void 0)
      this._options[r] = e;
    else {
      const g = this.parseDefine(r, e);
      typeof o == "string" ? this._options[g] = o : typeof o == "number" ? this._options[g] = o.toString() : this._options[g] = o ? "true" : "false";
    }
  }
  /**
   * Sets format-specific options with the specified defines.
   */
  setDefines(r) {
    r.getDefines().forEach((e) => {
      e !== void 0 && this.setDefine(e.format, e.name, e.value);
    });
  }
  /** @internal */
  _clone() {
    const r = new ft();
    return Object.assign(r, this), r;
  }
  /** @internal */
  _use(r) {
    const e = new Sr(this);
    return _e._disposeAfterExecution(e, r);
  }
  parseDefine(r, e) {
    return r === be.Unknown ? e : `${r}:${e}`;
  }
}
class Ie extends ft {
  constructor(r) {
    super(), Object.assign(this, r);
  }
  /**
   * Gets or sets the height.
   */
  height;
  /**
   * Gets or sets the width.
   */
  width;
  /** @internal */
  _use(r) {
    const e = new Sr(this), o = this.getSize();
    return o !== "" && L(o, (g) => {
      l._api._MagickSettings_SetSize(e._instance, g);
    }), _e._disposeAfterExecution(e, r);
  }
  getSize() {
    return this.width !== void 0 && this.height !== void 0 ? `${this.width}x${this.height}` : this.width !== void 0 ? `${this.width}x` : this.height !== void 0 ? `x${this.height}` : "";
  }
}
var ln = /* @__PURE__ */ ((t) => (t[t.Undefined = 0] = "Undefined", t[t.No = 1] = "No", t[t.Riemersma = 2] = "Riemersma", t[t.FloydSteinberg = 3] = "FloydSteinberg", t))(ln || {});
class pu extends Fe {
  constructor(r) {
    const e = l._api._QuantizeSettings_Create(), o = l._api._QuantizeSettings_Dispose;
    super(e, o), l._api._QuantizeSettings_SetColors(this._instance, r.colors), l._api._QuantizeSettings_SetColorSpace(this._instance, r.colorSpace), l._api._QuantizeSettings_SetDitherMethod(this._instance, r.ditherMethod ?? ln.No), l._api._QuantizeSettings_SetMeasureErrors(this._instance, r.measureErrors ? 1 : 0), l._api._QuantizeSettings_SetTreeDepth(this._instance, r.treeDepth);
  }
}
class nn {
  constructor() {
    this.colors = 256, this.colorSpace = dt.Undefined, this.ditherMethod = ln.Riemersma, this.measureErrors = !1, this.treeDepth = 0;
  }
  /**
   * Gets or sets the maximum number of colors to quantize to.
   */
  colors;
  /**
   * Gets or sets the colorspace to quantize in.
   */
  colorSpace;
  /// <summary>
  /// Gets or sets the dither method to use.
  /// </summary>
  ditherMethod;
  /// <summary>
  /// Gets or sets a value indicating whether errors should be measured.
  /// </summary>
  measureErrors;
  /// <summary>
  /// Gets or sets the quantization tree-depth.
  /// </summary>
  treeDepth;
  /** @internal */
  _use(r) {
    const e = new pu(this);
    return _e._disposeAfterExecution(e, r);
  }
}
class Ne {
  _image;
  _names = [];
  constructor(r) {
    this._image = r;
  }
  setArtifact(r, e) {
    this._names.push(r), this._image.setArtifact(r, e);
  }
  static use(r, e) {
    const o = new Ne(r);
    try {
      return e(o);
    } finally {
      o.dispose();
    }
  }
  dispose() {
    for (const r of this._names)
      this._image.removeArtifact(r);
  }
}
function cr(t, r) {
  if (t.byteLength === 0)
    throw new Z("The specified array cannot be empty");
  let e = 0;
  try {
    return e = l._api._malloc(t.byteLength), l._api.HEAPU8.set(t, e), r(e);
  } finally {
    e !== 0 && l._api._free(e);
  }
}
function kr(t, r) {
  if (t.length === 0)
    throw new Z("The specified array cannot be empty");
  const e = t.length * 8;
  let o = 0;
  try {
    o = l._api._malloc(e);
    const g = new ArrayBuffer(e), p = new Float64Array(g);
    for (let h = 0; h < t.length; h++)
      p[h] = t[h];
    return l._api.HEAPU8.set(new Int8Array(g), o), r(o);
  } finally {
    o !== 0 && l._api._free(o);
  }
}
function du(t, r) {
  if (t.byteLength === 0)
    throw new Z("The specified array cannot be empty");
  let e = 0;
  try {
    return e = l._api._malloc(t.byteLength), l._api.HEAPU8.set(t, e), r(e);
  } finally {
    e !== 0 && l._api._free(e);
  }
}
class Me extends Array {
  constructor() {
    super();
  }
  static create(r) {
    const e = Me.createObject();
    return r !== void 0 && e.read(r), e;
  }
  dispose() {
    let r = this.pop();
    for (; r !== void 0; )
      r.dispose(), r = this.pop();
  }
  appendHorizontally(r) {
    return this.createImage((e, o) => l._api._MagickImageCollection_Append(e, 0, o.ptr), r);
  }
  appendVertically(r) {
    return this.createImage((e, o) => l._api._MagickImageCollection_Append(e, 1, o.ptr), r);
  }
  clone(r) {
    const e = Me.create();
    for (let o = 0; o < this.length; o++)
      e.push(ne._clone(this[o]));
    return e._use(r);
  }
  coalesce() {
    this.replaceImages((r, e) => l._api._MagickImageCollection_Coalesce(r, e.ptr));
  }
  combine(r, e) {
    let o = e, g = dt.sRGB;
    return typeof r == "number" ? g = r : o = r, this.createImage((p, h) => l._api._MagickImageCollection_Combine(p, g, h.ptr), o);
  }
  complex(r, e) {
    return Ne.use(this[0], (o) => (r._setArtifacts(o), this.createImage((g, p) => l._api._MagickImageCollection_Complex(g, r.complexOperator, p.ptr), e)));
  }
  deconstruct() {
    this.replaceImages((r, e) => l._api._MagickImageCollection_Deconstruct(r, e.ptr));
  }
  evaluate(r, e) {
    return this.createImage((o, g) => l._api._MagickImageCollection_Evaluate(o, r, g.ptr), e);
  }
  flatten(r) {
    return this.mergeImages(mt.Flatten, r);
  }
  fx(r, e, o) {
    this.throwIfEmpty();
    let g = K.All, p = o;
    return typeof e == "number" ? g = e : p = e, L(r, (h) => this.createImage((S, G) => l._api._MagickImageCollection_Fx(S, h, g, G.ptr), p));
  }
  merge(r) {
    return this.mergeImages(mt.Merge, r);
  }
  montage(r, e) {
    return this.throwIfEmpty(), this.attachImages((o) => {
      const g = r._use((p) => T.use((h) => {
        const S = l._api._MagickImageCollection_Montage(o, p._instance, h.ptr);
        return this.checkResult(S, h);
      }));
      return Me._createFromImages(g, this.getSettings())._use((p) => {
        const h = r.transparentColor;
        return h !== void 0 && p.forEach((S) => {
          S.transparent(h);
        }), p.merge(e);
      });
    });
  }
  morph(r) {
    if (this.length < 2)
      throw new Z("operation requires at least two images");
    this.replaceImages((e, o) => l._api._MagickImageCollection_Morph(e, r, o.ptr));
  }
  mosaic(r) {
    return this.mergeImages(mt.Mosaic, r);
  }
  optimize() {
    this.replaceImages((r, e) => l._api._MagickImageCollection_Optimize(r, e.ptr));
  }
  optimizePlus() {
    this.replaceImages((r, e) => l._api._MagickImageCollection_OptimizePlus(r, e.ptr));
  }
  optimizeTransparency() {
    this.throwIfEmpty(), this.attachImages((r) => {
      T.usePointer((e) => {
        l._api._MagickImageCollection_OptimizeTransparency(r, e);
      });
    });
  }
  ping(r, e) {
    this.readOrPing(!0, r, e);
  }
  polynomial(r, e) {
    return this.createImage((o, g) => kr(r, (p) => l._api._MagickImageCollection_Polynomial(o, p, r.length, g.ptr)), e);
  }
  quantize(r) {
    this.throwIfEmpty();
    const e = r === void 0 ? new nn() : r;
    return this.attachImages((o) => {
      e._use((g) => {
        T.usePointer((p) => {
          l._api._MagickImageCollection_Quantize(o, g._instance, p);
        });
      });
    }), e.measureErrors ? xt._create(this[0]) : null;
  }
  read(r, e) {
    this.readOrPing(!1, r, e);
  }
  remap(r, e) {
    this.throwIfEmpty();
    const o = e === void 0 ? new nn() : e;
    this.attachImages((g) => {
      o._use((p) => {
        T.use((h) => {
          l._api._MagickImageCollection_Map(g, p._instance, r._instance, h.ptr);
        });
      });
    });
  }
  resetPage() {
    this.forEach((r) => {
      r.resetPage();
    });
  }
  smushHorizontal(r, e) {
    return this.smush(r, !1, e);
  }
  smushVertical(r, e) {
    return this.smush(r, !0, e);
  }
  trimBounds() {
    this.mergeImages(mt.Trimbounds, () => {
    });
  }
  write(r, e) {
    this.throwIfEmpty();
    let o = 0, g = 0;
    const p = this[0], h = this.getSettings();
    e !== void 0 ? h.format = r : (e = r, h.format = p.format), T.use((G) => {
      Ge.use((C) => {
        h._use((x) => {
          this.attachImages((re) => {
            o = l._api._MagickImage_WriteBlob(re, x._instance, C.ptr, G.ptr), g = C.value;
          });
        });
      });
    });
    const S = new yr(o, g, e);
    return _e._disposeAfterExecution(S, S.func);
  }
  /** @internal */
  static _createFromImages(r, e) {
    const o = Me.createObject();
    return o.addImages(r, e._clone()), o;
  }
  _use(r) {
    return _e._disposeAfterExecution(this, r);
  }
  addImages(r, e) {
    e.format = be.Unknown;
    let o = r;
    for (; o !== 0; ) {
      const g = l._api._MagickImage_GetNext(o);
      l._api._MagickImage_SetNext(o, 0), this.push(ne._createFromImage(o, e)), o = g;
    }
  }
  attachImages(r) {
    try {
      for (let e = 0; e < this.length - 1; e++)
        l._api._MagickImage_SetNext(this[e]._instance, this[e + 1]._instance);
      return r(this[0]._instance);
    } finally {
      for (let e = 0; e < this.length - 1; e++)
        l._api._MagickImage_SetNext(this[e]._instance, 0);
    }
  }
  checkResult(r, e) {
    return e.check(() => r, () => (l._api._MagickImageCollection_Dispose(r), 0));
  }
  static createObject() {
    return Object.create(Me.prototype);
  }
  createImage(r, e) {
    this.throwIfEmpty();
    const o = this.attachImages((p) => T.use((h) => {
      const S = r(p, h);
      return this.checkResult(S, h);
    }));
    return ne._createFromImage(o, this.getSettings())._use(e);
  }
  getSettings() {
    return this[0]._getSettings()._clone();
  }
  mergeImages(r, e) {
    return this.createImage((o, g) => l._api._MagickImageCollection_Merge(o, r, g.ptr), e);
  }
  readOrPing(r, e, o) {
    this.dispose(), T.use((g) => {
      const p = o === void 0 ? new Ie() : new Ie(o);
      p._ping = r, typeof e == "string" ? (p._fileName = e, p._use((h) => {
        const S = l._api._MagickImageCollection_ReadFile(h._instance, g.ptr);
        this.addImages(S, p);
      })) : p._use((h) => {
        const S = e.byteLength;
        let G = 0;
        try {
          G = l._api._malloc(S), l._api.HEAPU8.set(e, G);
          const C = l._api._MagickImageCollection_ReadBlob(h._instance, G, 0, S, g.ptr);
          this.addImages(C, p);
        } finally {
          G !== 0 && l._api._free(G);
        }
      });
    });
  }
  replaceImages(r) {
    this.throwIfEmpty();
    const e = this.attachImages((g) => T.use((p) => {
      const h = r(g, p);
      return this.checkResult(h, p);
    })), o = this.getSettings()._clone();
    this.dispose(), this.addImages(e, o);
  }
  smush(r, e, o) {
    return this.createImage((g, p) => l._api._MagickImageCollection_Smush(g, r, e ? 1 : 0, p.ptr), o);
  }
  throwIfEmpty() {
    if (this.length === 0)
      throw new Z("operation requires at least one image");
  }
}
class ie {
  _value;
  /**
   * Initializes a new instance of the {@link Percentage} class.
   * @param value -The value (0% = 0.0, 100% = 100.0)
   */
  constructor(r) {
    this._value = r;
  }
  /** @internal */
  static _fromQuantum(r) {
    return new ie(r / Ue.max * 100);
  }
  /**
   * ultiplies the value by the specified percentage.
   * @param value The value to use.
   * @returns The new value.
   */
  multiply(r) {
    return r * this._value / 100;
  }
  /**
   * Returns a double that represents the current percentage.
   * @returns A double that represents the current percentage.
   */
  toDouble() {
    return this._value;
  }
  /** @internal */
  _toQuantum() {
    return Ue.max * (this._value / 100);
  }
}
class gr {
  static use(r, e, o) {
    const g = l._api._MagickRectangle_Create();
    try {
      l._api._MagickRectangle_X_Set(g, e.x), l._api._MagickRectangle_Y_Set(g, e.y);
      let p = e.width, h = e.height;
      return e.isPercentage && (p = new ie(e.width).multiply(r.width), h = new ie(e.height).multiply(r.height)), l._api._MagickRectangle_Width_Set(g, p), l._api._MagickRectangle_Height_Set(g, h), o(g);
    } finally {
      l._api._MagickRectangle_Dispose(g);
    }
  }
}
class Qe extends Fe {
  image;
  constructor(r) {
    const e = T.usePointer((g) => l._api._PixelCollection_Create(r._instance, g)), o = l._api._PixelCollection_Dispose;
    super(e, o), this.image = r;
  }
  /** @internal */
  static _create(r) {
    return new Qe(r);
  }
  static _use(r, e) {
    const o = new Qe(r);
    return _e._disposeAfterExecution(o, e);
  }
  /** @internal */
  static _map(r, e, o) {
    const g = new Qe(r);
    try {
      g.use(0, 0, r.width, r.height, e, (p) => {
        o(p);
      });
    } finally {
      g.dispose();
    }
  }
  getArea(r, e, o, g) {
    return T.usePointer((p) => {
      const h = l._api._PixelCollection_GetArea(this._instance, r, e, o, g, p), S = o * g * this.image.channelCount;
      return l._api.HEAPU8.subarray(h, h + S);
    });
  }
  getPixel(r, e) {
    return this.getArea(r, e, 1, 1);
  }
  setArea(r, e, o, g, p) {
    T.usePointer((h) => {
      const S = p instanceof Uint8Array ? p : new Uint8Array(p);
      du(S, (G) => {
        l._api._PixelCollection_SetArea(this._instance, r, e, o, g, G, S.length, h);
      });
    });
  }
  setPixel(r, e, o) {
    o instanceof Uint8Array ? this.setArea(r, e, 1, 1, o) : this.setArea(r, e, 1, 1, o);
  }
  toByteArray(r, e, o, g, p) {
    return this.use(r, e, o, g, p, (h) => {
      if (h === 0)
        return null;
      const S = o * g * p.length;
      return l._api.HEAPU8.slice(h, h + S);
    });
  }
  use(r, e, o, g, p, h) {
    return L(p, (S) => T.use((G) => {
      let C = l._api._PixelCollection_ToByteArray(this._instance, r, e, o, g, S, G.ptr);
      return G.check(() => {
        const x = h(C);
        return C = l._api._MagickMemory_Relinquish(C), x;
      }, () => (C = l._api._MagickMemory_Relinquish(C), null));
    }));
  }
}
var vr = /* @__PURE__ */ ((t) => (t[t.Undefined = 0] = "Undefined", t[t.Average = 1] = "Average", t[t.Brightness = 2] = "Brightness", t[t.Lightness = 3] = "Lightness", t[t.MS = 4] = "MS", t[t.Rec601Luma = 5] = "Rec601Luma", t[t.Rec601Luminance = 6] = "Rec601Luminance", t[t.Rec709Luma = 7] = "Rec709Luma", t[t.Rec709Luminance = 8] = "Rec709Luminance", t[t.RMS = 9] = "RMS", t))(vr || {});
class He {
  /**
   * Initializes a new instance of the {@link PrimaryInfo} class.
   * @param x The x,
   * @param y The y.
   * @param z The z.
   */
  constructor(r, e, o) {
    this.x = r, this.y = e, this.z = o;
  }
  /**
   * Gets the X value.
   */
  x;
  /**
   * Gets the Y value.
   */
  y;
  /**
   * Gets the Z value.
   */
  z;
  /** @internal */
  static _create(r) {
    return r === 0 ? new He(0, 0, 0) : new He(
      l._api._PrimaryInfo_X_Get(r),
      l._api._PrimaryInfo_Y_Get(r),
      l._api._PrimaryInfo_Z_Get(r)
    );
  }
  /** @internal */
  _use(r) {
    let e = 0;
    try {
      e = l._api._PrimaryInfo_Create(), l._api._PrimaryInfo_X_Set(e, this.x), l._api._PrimaryInfo_Y_Set(e, this.y), l._api._PrimaryInfo_Z_Set(e, this.z), r(e);
    } finally {
      l._api._free(e);
    }
  }
}
class hu {
  channel;
  depth;
  entropy;
  kurtosis;
  maximum;
  mean;
  minimum;
  skewness;
  standardDeviation;
  constructor(r, e) {
    this.channel = r, this.depth = l._api._ChannelStatistics_Depth_Get(e), this.entropy = l._api._ChannelStatistics_Entropy_Get(e), this.kurtosis = l._api._ChannelStatistics_Kurtosis_Get(e), this.maximum = l._api._ChannelStatistics_Maximum_Get(e), this.mean = l._api._ChannelStatistics_Mean_Get(e), this.minimum = l._api._ChannelStatistics_Minimum_Get(e), this.skewness = l._api._ChannelStatistics_Skewness_Get(e), this.standardDeviation = l._api._ChannelStatistics_StandardDeviation_Get(e);
  }
}
class cn {
  _channels = {};
  get channels() {
    const r = [];
    for (const e in this._channels)
      r.push(parseInt(e));
    return r;
  }
  composite() {
    return this._channels[A.Composite];
  }
  getChannel(r) {
    const e = this._channels[r];
    return e !== void 0 ? e : null;
  }
  static _create(r, e, o) {
    const g = new cn();
    return r.channels.forEach((p) => {
      o >> p & 1 && g.addChannel(e, p);
    }), g.addChannel(e, A.Composite), g;
  }
  addChannel(r, e) {
    const o = l._api._Statistics_GetInstance(r, e);
    o !== 0 && (this._channels[e] = new hu(e, o));
  }
}
class yu {
  static toArray(r) {
    if (r === 0)
      return null;
    const e = l._api._StringInfo_Datum_Get(r), o = l._api._StringInfo_Length_Get(r);
    return l._api.HEAPU8.subarray(e, e + o);
  }
}
class mr {
  /** @internal */
  constructor(r) {
    this.error = r;
  }
  /**
   * Gets the warning that was raised.
   */
  error;
}
class ne extends Fe {
  _settings;
  _progress;
  _warning;
  constructor(r, e) {
    super(r, l._api._MagickImage_Dispose), this._settings = e;
  }
  get animationDelay() {
    return l._api._MagickImage_AnimationDelay_Get(this._instance);
  }
  set animationDelay(r) {
    l._api._MagickImage_AnimationDelay_Set(this._instance, r);
  }
  get animationIterations() {
    return l._api._MagickImage_AnimationIterations_Get(this._instance);
  }
  set animationIterations(r) {
    l._api._MagickImage_AnimationIterations_Set(this._instance, r);
  }
  get animationTicksPerSecond() {
    return l._api._MagickImage_AnimationTicksPerSecond_Get(this._instance);
  }
  set animationTicksPerSecond(r) {
    l._api._MagickImage_AnimationTicksPerSecond_Set(this._instance, r);
  }
  get artifactNames() {
    const r = [];
    l._api._MagickImage_ResetArtifactIterator(this._instance);
    let e = l._api._MagickImage_GetNextArtifactName(this._instance);
    for (; e !== 0; )
      r.push(l._api.UTF8ToString(e)), e = l._api._MagickImage_GetNextArtifactName(this._instance);
    return r;
  }
  get attributeNames() {
    const r = [];
    l._api._MagickImage_ResetAttributeIterator(this._instance);
    let e = l._api._MagickImage_GetNextAttributeName(this._instance);
    for (; e !== 0; )
      r.push(l._api.UTF8ToString(e)), e = l._api._MagickImage_GetNextAttributeName(this._instance);
    return r;
  }
  get backgroundColor() {
    const r = l._api._MagickImage_BackgroundColor_Get(this._instance);
    return w._create(r);
  }
  set backgroundColor(r) {
    r._use((e) => {
      l._api._MagickImage_BackgroundColor_Set(this._instance, e);
    });
  }
  get baseHeight() {
    return l._api._MagickImage_BaseHeight_Get(this._instance);
  }
  get baseWidth() {
    return l._api._MagickImage_BaseWidth_Get(this._instance);
  }
  get blackPointCompensation() {
    return l._api._MagickImage_BlackPointCompensation_Get(this._instance) === 1;
  }
  set blackPointCompensation(r) {
    l._api._MagickImage_BlackPointCompensation_Set(this._instance, r ? 1 : 0);
  }
  get borderColor() {
    const r = l._api._MagickImage_BorderColor_Get(this._instance);
    return w._create(r);
  }
  set borderColor(r) {
    r._use((e) => {
      l._api._MagickImage_BorderColor_Set(this._instance, e);
    });
  }
  get boundingBox() {
    return this.useExceptionPointer((r) => {
      const e = l._api._MagickImage_BoundingBox_Get(this._instance, r), o = ce._fromRectangle(e);
      return o.width === 0 || o.height === 0 ? null : o;
    });
  }
  get channelCount() {
    return l._api._MagickImage_ChannelCount_Get(this._instance);
  }
  get channels() {
    const r = [];
    return [A.Red, A.Green, A.Blue, A.Black, A.Alpha].forEach((e) => {
      l._api._MagickImage_HasChannel(this._instance, e) && r.push(e);
    }), r;
  }
  get chromaticity() {
    return new _u(
      He._create(l._api._MagickImage_ChromaRed_Get(this._instance)),
      He._create(l._api._MagickImage_ChromaGreen_Get(this._instance)),
      He._create(l._api._MagickImage_ChromaBlue_Get(this._instance)),
      He._create(l._api._MagickImage_ChromaWhite_Get(this._instance))
    );
  }
  set chromaticity(r) {
    r.blue._use((e) => l._api._MagickImage_ChromaBlue_Set(this._instance, e)), r.green._use((e) => l._api._MagickImage_ChromaGreen_Set(this._instance, e)), r.red._use((e) => l._api._MagickImage_ChromaRed_Set(this._instance, e)), r.white._use((e) => l._api._MagickImage_ChromaWhite_Set(this._instance, e));
  }
  get classType() {
    return l._api._MagickImage_ClassType_Get(this._instance);
  }
  set classType(r) {
    this.useExceptionPointer((e) => {
      l._api._MagickImage_ClassType_Set(this._instance, r, e);
    });
  }
  get colorFuzz() {
    return ie._fromQuantum(l._api._MagickImage_ColorFuzz_Get(this._instance));
  }
  set colorFuzz(r) {
    l._api._MagickImage_ColorFuzz_Set(this._instance, r._toQuantum());
  }
  get colormapSize() {
    return l._api._MagickImage_ColormapSize_Get(this._instance);
  }
  set colormapSize(r) {
    this.useExceptionPointer((e) => {
      l._api._MagickImage_ColormapSize_Set(this._instance, r, e);
    });
  }
  get colorSpace() {
    return l._api._MagickImage_ColorSpace_Get(this._instance);
  }
  set colorSpace(r) {
    this.useExceptionPointer((e) => {
      l._api._MagickImage_ColorSpace_Set(this._instance, r, e);
    });
  }
  get colorType() {
    return this.settings.colorType !== void 0 ? this.settings.colorType : l._api._MagickImage_ColorType_Get(this._instance);
  }
  set colorType(r) {
    this.useExceptionPointer((e) => {
      l._api._MagickImage_ColorType_Set(this._instance, r, e);
    });
  }
  get comment() {
    return this.getAttribute("comment");
  }
  set comment(r) {
    r === null ? this.removeAttribute("comment") : this.setAttribute("comment", r);
  }
  get compose() {
    return l._api._MagickImage_Compose_Get(this._instance);
  }
  set compose(r) {
    l._api._MagickImage_Compose_Set(this._instance, r);
  }
  get compression() {
    return l._api._MagickImage_Compression_Get(this._instance);
  }
  get density() {
    return new hr(
      l._api._MagickImage_ResolutionX_Get(this._instance),
      l._api._MagickImage_ResolutionY_Get(this._instance),
      l._api._MagickImage_ResolutionUnits_Get(this._instance)
    );
  }
  set density(r) {
    l._api._MagickImage_ResolutionX_Set(this._instance, r.x), l._api._MagickImage_ResolutionY_Set(this._instance, r.y), l._api._MagickImage_ResolutionUnits_Set(this._instance, r.units);
  }
  get depth() {
    return l._api._MagickImage_Depth_Get(this._instance);
  }
  set depth(r) {
    l._api._MagickImage_Depth_Set(this._instance, r);
  }
  get endian() {
    return l._api._MagickImage_Endian_Get(this._instance);
  }
  set endian(r) {
    l._api._MagickImage_Endian_Set(this._instance, r);
  }
  get fileName() {
    const r = l._api._MagickImage_FileName_Get(this._instance);
    return r === 0 ? null : l._api.UTF8ToString(r);
  }
  get filterType() {
    return l._api._MagickImage_FilterType_Get(this._instance);
  }
  set filterType(r) {
    l._api._MagickImage_FilterType_Set(this._instance, r);
  }
  get format() {
    return ge(l._api._MagickImage_Format_Get(this._instance));
  }
  set format(r) {
    L(r.toString(), (e) => l._api._MagickImage_Format_Set(this._instance, e));
  }
  get gamma() {
    return l._api._MagickImage_Gamma_Get(this._instance);
  }
  get gifDisposeMethod() {
    return l._api._MagickImage_GifDisposeMethod_Get(this._instance);
  }
  set gifDisposeMethod(r) {
    l._api._MagickImage_GifDisposeMethod_Set(this._instance, r);
  }
  get hasAlpha() {
    return this.toBool(l._api._MagickImage_HasAlpha_Get(this._instance));
  }
  set hasAlpha(r) {
    this.useExceptionPointer((e) => {
      r && this.alpha(pr.Opaque), l._api._MagickImage_HasAlpha_Set(this._instance, this.fromBool(r), e);
    });
  }
  get height() {
    return l._api._MagickImage_Height_Get(this._instance);
  }
  get interlace() {
    return l._api._MagickImage_Interlace_Get(this._instance);
  }
  get isOpaque() {
    return this.useExceptionPointer((r) => this.toBool(l._api._MagickImage_IsOpaque_Get(this._instance, r)));
  }
  get interpolate() {
    return l._api._MagickImage_Interpolate_Get(this._instance);
  }
  set interpolate(r) {
    l._api._MagickImage_Interpolate_Set(this._instance, r);
  }
  get label() {
    return this.getAttribute("label");
  }
  set label(r) {
    r === null ? this.removeAttribute("label") : this.setAttribute("label", r);
  }
  get matteColor() {
    const r = l._api._MagickImage_MatteColor_Get(this._instance);
    return w._create(r);
  }
  set matteColor(r) {
    r._use((e) => {
      l._api._MagickImage_MatteColor_Set(this._instance, e);
    });
  }
  get orientation() {
    return l._api._MagickImage_Orientation_Get(this._instance);
  }
  set orientation(r) {
    l._api._MagickImage_Orientation_Set(this._instance, r);
  }
  get onProgress() {
    return this._progress;
  }
  set onProgress(r) {
    r !== void 0 ? ae.setProgressDelegate(this) : this.disposeProgressDelegate(), this._progress = r;
  }
  get onWarning() {
    return this._warning;
  }
  set onWarning(r) {
    this._warning = r;
  }
  get page() {
    const r = l._api._MagickImage_Page_Get(this._instance);
    return ce._fromRectangle(r);
  }
  set page(r) {
    r._toRectangle((e) => {
      l._api._MagickImage_Page_Set(this._instance, e);
    });
  }
  get profileNames() {
    const r = [];
    l._api._MagickImage_ResetProfileIterator(this._instance);
    let e = l._api._MagickImage_GetNextProfileName(this._instance);
    for (; e !== 0; )
      r.push(l._api.UTF8ToString(e)), e = l._api._MagickImage_GetNextProfileName(this._instance);
    return r;
  }
  get quality() {
    return l._api._MagickImage_Quality_Get(this._instance);
  }
  set quality(r) {
    let e = r < 1 ? 1 : r;
    e = e > 100 ? 100 : e, l._api._MagickImage_Quality_Set(this._instance, e), this._settings._quality = e;
  }
  get renderingIntent() {
    return l._api._MagickImage_RenderingIntent_Get(this._instance);
  }
  set renderingIntent(r) {
    l._api._MagickImage_RenderingIntent_Set(this._instance, r);
  }
  get settings() {
    return this._settings;
  }
  get signature() {
    return this.useExceptionPointer((r) => ge(l._api._MagickImage_Signature_Get(this._instance, r)));
  }
  get totalColors() {
    return this.useExceptionPointer((r) => l._api._MagickImage_TotalColors_Get(this._instance, r));
  }
  get virtualPixelMethod() {
    return l._api._MagickImage_VirtualPixelMethod_Get(this._instance);
  }
  set virtualPixelMethod(r) {
    this.useExceptionPointer((e) => {
      l._api._MagickImage_VirtualPixelMethod_Set(this._instance, r, e);
    });
  }
  get width() {
    return l._api._MagickImage_Width_Get(this._instance);
  }
  adaptiveBlur(r, e) {
    const o = this.valueOrDefault(r, 0), g = this.valueOrDefault(e, 1);
    this.useException((p) => {
      const h = l._api._MagickImage_AdaptiveBlur(this._instance, o, g, p.ptr);
      this._setInstance(h, p);
    });
  }
  alpha(r) {
    this.useExceptionPointer((e) => {
      l._api._MagickImage_SetAlpha(this._instance, r, e);
    });
  }
  autoGamma(r) {
    this.useExceptionPointer((e) => {
      const o = this.valueOrDefault(r, K.Composite);
      l._api._MagickImage_AutoGamma(this._instance, o, e);
    });
  }
  autoLevel(r) {
    this.useExceptionPointer((e) => {
      const o = this.valueOrDefault(r, K.Undefined);
      l._api._MagickImage_AutoLevel(this._instance, o, e);
    });
  }
  autoOrient() {
    this.useException((r) => {
      const e = l._api._MagickImage_AutoOrient(this._instance, r.ptr);
      this._setInstance(e, r);
    });
  }
  autoThreshold(r) {
    this.useException((e) => {
      l._api._MagickImage_AutoThreshold(this._instance, r, e.ptr);
    });
  }
  blur(r, e, o) {
    let g = 0;
    const p = this.valueOrDefault(e, 1);
    let h = this.valueOrDefault(o, K.Undefined);
    r !== void 0 && (e === void 0 ? h = r : g = r), this.useException((S) => {
      const G = l._api._MagickImage_Blur(this._instance, g, p, h, S.ptr);
      this._setInstance(G, S);
    });
  }
  border(r, e) {
    const o = r, g = this.valueOrDefault(e, r), p = new ce(0, 0, o, g);
    this.useException((h) => {
      p._toRectangle((S) => {
        const G = l._api._MagickImage_Border(this._instance, S, h.ptr);
        this._setInstance(G, h);
      });
    });
  }
  brightnessContrast(r, e, o) {
    const g = this.valueOrDefault(o, K.Undefined);
    this.useException((p) => {
      l._api._MagickImage_BrightnessContrast(this._instance, r.toDouble(), e.toDouble(), g, p.ptr);
    });
  }
  charcoal(r, e) {
    const o = r === void 0 ? 0 : r, g = e === void 0 ? 1 : e;
    this.useException((p) => {
      const h = l._api._MagickImage_Charcoal(this._instance, o, g, p.ptr);
      this._setInstance(h, p);
    });
  }
  clahe(r, e, o, g) {
    this.useExceptionPointer((p) => {
      const h = r instanceof ie ? r.multiply(this.width) : r, S = e instanceof ie ? e.multiply(this.height) : e;
      l._api._MagickImage_Clahe(this._instance, h, S, o, g, p);
    });
  }
  clone(r) {
    return ne._clone(this)._use(r);
  }
  colorAlpha(r) {
    if (!this.hasAlpha)
      return;
    const e = ne.create();
    e.read(r, this.width, this.height), e.composite(this, Rt.SrcOver, new ve(0, 0)), this._instance = e._instance;
  }
  compare(r, e, o, g) {
    const p = e instanceof lu, h = p ? e.metric : e;
    let S = o;
    g !== void 0 && (S = g);
    let G = K.Undefined;
    if (typeof S != "function")
      return S !== void 0 && (G = S), this.useExceptionPointer((x) => l._api._MagickImage_CompareDistortion(this._instance, r._instance, h, G, x));
    o !== void 0 && typeof o != "function" && (G = o);
    const C = Ne.use(this, (x) => (p && e._setArtifacts(x), _n.use((re) => {
      const pe = this.useExceptionPointer((Je) => l._api._MagickImage_Compare(this._instance, r._instance, h, G, re.ptr, Je)), Pe = re.value, Re = ne._createFromImage(pe, this._settings);
      return an._create(Pe, Re);
    })));
    return C.difference._use(() => S(C));
  }
  composite(r, e, o, g, p) {
    let h = 0, S = 0, G = Rt.In, C = K.All, x = null;
    e instanceof ve ? (h = e.x, S = e.y) : e !== void 0 && (G = e), o instanceof ve ? (h = o.x, S = o.y) : typeof o == "string" ? x = o : o !== void 0 && (C = o), typeof g == "string" ? x = g : g !== void 0 && (C = g), p !== void 0 && (C = p), x !== null && this.setArtifact("compose:args", x), this.useExceptionPointer((re) => {
      l._api._MagickImage_Composite(this._instance, r._instance, h, S, G, C, re);
    }), x !== null && this.removeArtifact("compose:args");
  }
  compositeGravity(r, e, o, g, p, h) {
    let S = 0, G = 0, C = Rt.In, x = K.All, re = null;
    o instanceof ve ? (S = o.x, G = o.y) : o !== void 0 && (C = o), g instanceof ve ? (S = g.x, G = g.y) : typeof g == "string" ? re = g : g !== void 0 && (x = g), typeof p == "string" ? re = p : p !== void 0 && (x = p), h !== void 0 && (x = h), re !== null && this.setArtifact("compose:args", re), this.useExceptionPointer((pe) => {
      l._api._MagickImage_CompositeGravity(this._instance, r._instance, e, S, G, C, x, pe);
    }), re !== null && this.removeArtifact("compose:args");
  }
  connectedComponents(r) {
    const e = typeof r == "number" ? new cu(r) : r;
    return Ne.use(this, (g) => (e._setArtifacts(g), this.useException((p) => Ge.use((h) => {
      try {
        const S = l._api._MagickImage_ConnectedComponents(this._instance, e.connectivity, h.ptr, p.ptr);
        return this._setInstance(S, p), sn._create(h.value, this.colormapSize);
      } finally {
        h.value !== 0 && l._api._ConnectedComponent_DisposeList(h.value);
      }
    }))));
  }
  contrast = () => this._contrast(!0);
  contrastStretch(r, e, o) {
    const g = this.width * this.height, p = r.multiply(g);
    let h = 0, S = this.valueOrDefault(o, K.Undefined);
    e instanceof ie ? h = g - e.multiply(g) : (h = g - r.multiply(g), e !== void 0 && (S = e)), this.useExceptionPointer((G) => {
      l._api._MagickImage_ContrastStretch(this._instance, p, h, S, G);
    });
  }
  static create(r, e, o) {
    const g = new ne(ne.createInstance(), new ft());
    return r !== void 0 && g.readOrPing(!1, r, e, o), g;
  }
  crop(r, e, o) {
    let g, p;
    typeof r != "number" ? (g = r, p = this.valueOrDefault(e, Ct.Undefined)) : e !== void 0 && (g = new ce(r, e), p = this.valueOrDefault(o, Ct.Undefined)), this.useException((h) => {
      L(g.toString(), (S) => {
        const G = l._api._MagickImage_Crop(this._instance, S, p, h.ptr);
        this._setInstance(G, h);
      });
    });
  }
  cropToTiles(r, e, o) {
    let g, p;
    return typeof r == "number" && typeof e == "number" && o !== void 0 ? (g = new ce(0, 0, r, e), p = o) : typeof r != "number" && typeof e != "number" && (g = r, p = e), this.useException((h) => L(g.toString(), (S) => {
      const G = l._api._MagickImage_CropToTiles(this._instance, S, h.ptr);
      return Me._createFromImages(G, this._settings)._use(p);
    }));
  }
  deskew(r, e) {
    return Ne.use(this, (o) => {
      e !== void 0 && o.setArtifact("deskew:auto-crop", e), this.useException((p) => {
        const h = l._api._MagickImage_Deskew(this._instance, r._toQuantum(), p.ptr);
        this._setInstance(h, p);
      });
      const g = Number(this.getArtifact("deskew:angle"));
      return isNaN(g) ? 0 : g;
    });
  }
  distort(r, e) {
    Ne.use(this, (o) => {
      let g, p = 0;
      typeof r == "number" ? g = r : (g = r.method, p = r.bestFit ? 1 : 0, r._setArtifacts(o)), this.useException((h) => {
        kr(e, (S) => {
          const G = l._api._MagickImage_Distort(this._instance, g, p, S, e.length, h.ptr);
          this._setInstance(G, h);
        });
      });
    });
  }
  draw(...r) {
    const e = r.flat();
    e.length !== 0 && Lt._use(this, (o) => {
      o.draw(e);
    });
  }
  evaluate(r, e, o, g) {
    if (typeof e == "number") {
      const p = e, h = typeof o == "number" ? o : o._toQuantum();
      this.useExceptionPointer((S) => {
        l._api._MagickImage_EvaluateOperator(this._instance, r, p, h, S);
      });
    } else if (g !== void 0) {
      if (typeof o != "number")
        throw new Z("this should not happen");
      const p = e, h = o, S = typeof g == "number" ? g : g._toQuantum();
      if (p.isPercentage)
        throw new Z("percentage is not supported");
      this.useExceptionPointer((G) => {
        gr.use(this, p, (C) => {
          l._api._MagickImage_EvaluateGeometry(this._instance, r, C, h, S, G);
        });
      });
    }
  }
  extent(r, e, o) {
    let g = Ct.Undefined, p;
    typeof r != "number" ? p = r : typeof e == "number" && (p = new ce(r, e)), typeof e == "number" ? g = e : e !== void 0 && (this.backgroundColor = e), typeof o == "number" ? g = o : o !== void 0 && (this.backgroundColor = o), this.useException((h) => {
      L(p.toString(), (S) => {
        const G = l._api._MagickImage_Extent(this._instance, S, g, h.ptr);
        this._setInstance(G, h);
      });
    });
  }
  flip() {
    this.useException((r) => {
      const e = l._api._MagickImage_Flip(this._instance, r.ptr);
      this._setInstance(e, r);
    });
  }
  flop() {
    this.useException((r) => {
      const e = l._api._MagickImage_Flop(this._instance, r.ptr);
      this._setInstance(e, r);
    });
  }
  gammaCorrect(r, e) {
    const o = this.valueOrDefault(e, K.Undefined);
    this.useExceptionPointer((g) => {
      l._api._MagickImage_GammaCorrect(this._instance, r, o, g);
    });
  }
  gaussianBlur(r, e, o) {
    const g = this.valueOrDefault(e, 1), p = this.valueOrDefault(o, K.Undefined);
    this.useException((h) => {
      const S = l._api._MagickImage_GaussianBlur(this._instance, r, g, p, h.ptr);
      this._setInstance(S, h);
    });
  }
  getArtifact(r) {
    return L(r, (e) => {
      const o = l._api._MagickImage_GetArtifact(this._instance, e);
      return ge(o);
    });
  }
  getAttribute(r) {
    return this.useException((e) => L(r, (o) => {
      const g = l._api._MagickImage_GetAttribute(this._instance, o, e.ptr);
      return ge(g);
    }));
  }
  getPixels(r) {
    if (this._settings._ping)
      throw new Z("image contains no pixel data");
    return Qe._use(this, r);
  }
  getProfile(r) {
    return L(r, (e) => {
      const o = l._api._MagickImage_GetProfile(this._instance, e), g = yu.toArray(o);
      return g === null ? null : new fu(r, g);
    });
  }
  getWriteMask(r) {
    const e = this.useExceptionPointer((g) => l._api._MagickImage_GetWriteMask(this._instance, g)), o = e === 0 ? null : new ne(e, new ft());
    return o == null ? r(o) : o._use(r);
  }
  grayscale(r = vr.Undefined) {
    this.useExceptionPointer((e) => {
      l._api._MagickImage_Grayscale(this._instance, r, e);
    });
  }
  histogram() {
    const r = /* @__PURE__ */ new Map();
    return this.useExceptionPointer((e) => {
      Ge.use((o) => {
        const g = l._api._MagickImage_Histogram(this._instance, o.ptr, e);
        if (g !== 0) {
          const p = o.value;
          for (let h = 0; h < p; h++) {
            const S = l._api._MagickColorCollection_GetInstance(g, h), G = w._create(S), C = l._api._MagickColor_Count_Get(S);
            r.set(G.toString(), C);
          }
          l._api._MagickColorCollection_DisposeList(g);
        }
      });
    }), r;
  }
  inverseContrast = () => this._contrast(!1);
  inverseLevel(r, e, o, g) {
    const p = this.valueOrDefault(o, 1), h = this.valueOrDefault(g, K.Composite);
    this.useExceptionPointer((S) => {
      l._api._MagickImage_InverseLevel(this._instance, r.toDouble(), e._toQuantum(), p, h, S);
    });
  }
  inverseOpaque = (r, e) => this._opaque(r, e, !0);
  inverseSigmoidalContrast(r, e, o) {
    this._sigmoidalContrast(!1, r, e, o);
  }
  inverseTransparent = (r) => this._transparent(r, !0);
  level(r, e, o, g) {
    const p = this.valueOrDefault(o, 1), h = this.valueOrDefault(g, K.Composite);
    this.useExceptionPointer((S) => {
      l._api._MagickImage_Level(this._instance, r.toDouble(), e._toQuantum(), p, h, S);
    });
  }
  linearStretch(r, e) {
    this.useExceptionPointer((o) => {
      l._api._MagickImage_LinearStretch(this._instance, r.toDouble(), e._toQuantum(), o);
    });
  }
  liquidRescale(r, e) {
    const o = typeof r == "number" ? new ce(r, e) : r;
    this.useException((g) => {
      L(o.toString(), (p) => {
        const h = l._api._MagickImage_LiquidRescale(this._instance, p, o.x, o.y, g.ptr);
        this._setInstance(h, g);
      });
    });
  }
  negate(r) {
    this.useExceptionPointer((e) => {
      const o = this.valueOrDefault(r, K.Undefined);
      l._api._MagickImage_Negate(this._instance, 0, o, e);
    });
  }
  negateGrayScale(r) {
    this.useExceptionPointer((e) => {
      const o = this.valueOrDefault(r, K.Undefined);
      l._api._MagickImage_Negate(this._instance, 1, o, e);
    });
  }
  normalize() {
    this.useExceptionPointer((r) => {
      l._api._MagickImage_Normalize(this._instance, r);
    });
  }
  modulate(r, e, o) {
    const g = this.valueOrDefault(e, new ie(100)), p = this.valueOrDefault(o, new ie(100));
    this.useExceptionPointer((h) => {
      const S = `${r.toDouble()}/${g.toDouble()}/${p.toDouble()}`;
      L(S, (G) => {
        l._api._MagickImage_Modulate(this._instance, G, h);
      });
    });
  }
  morphology(r) {
    this.useException((e) => {
      L(r.kernel, (o) => {
        const g = l._api._MagickImage_Morphology(this._instance, r.method, o, r.channels, r.iterations, e.ptr);
        this._setInstance(g, e);
      });
    });
  }
  motionBlur(r, e, o) {
    this.useException((g) => {
      const p = l._api._MagickImage_MotionBlur(this._instance, r, e, o, g.ptr);
      this._setInstance(p, g);
    });
  }
  oilPaint(r) {
    const e = this.valueOrDefault(r, 3), o = 0;
    this.useException((g) => {
      const p = l._api._MagickImage_OilPaint(this._instance, e, o, g.ptr);
      this._setInstance(p, g);
    });
  }
  opaque = (r, e) => this._opaque(r, e, !1);
  ping(r, e) {
    this.readOrPing(!0, r, e);
  }
  quantize(r) {
    const e = this.valueOrDefault(r, new nn());
    return this.useException((o) => {
      e._use((g) => {
        l._api._MagickImage_Quantize(this._instance, g._instance, o.ptr);
      });
    }), e.measureErrors ? xt._create(this) : null;
  }
  read(r, e, o) {
    this.readOrPing(!1, r, e, o);
  }
  readFromCanvas(r, e) {
    const o = r.getContext("2d", e);
    if (o === null)
      return;
    const g = o.getImageData(0, 0, r.width, r.height), p = new Ie();
    p.format = be.Rgba, p.width = r.width, p.height = r.height, this.useException((h) => {
      this.readFromArray(g.data, p, h);
    });
  }
  removeArtifact(r) {
    L(r, (e) => {
      l._api._MagickImage_RemoveArtifact(this._instance, e);
    });
  }
  removeAttribute(r) {
    L(r, (e) => {
      l._api._MagickImage_RemoveAttribute(this._instance, e);
    });
  }
  removeProfile(r) {
    const e = typeof r == "string" ? r : r.name;
    L(e, (o) => {
      l._api._MagickImage_RemoveProfile(this._instance, o);
    });
  }
  removeWriteMask() {
    this.useExceptionPointer((r) => {
      l._api._MagickImage_SetWriteMask(this._instance, 0, r);
    });
  }
  resetPage() {
    this.page = new ce(0, 0, 0, 0);
  }
  resize(r, e) {
    const o = typeof r == "number" ? new ce(r, e) : r;
    this.useException((g) => {
      L(o.toString(), (p) => {
        const h = l._api._MagickImage_Resize(this._instance, p, g.ptr);
        this._setInstance(h, g);
      });
    });
  }
  rotate(r) {
    this.useException((e) => {
      const o = l._api._MagickImage_Rotate(this._instance, r, e.ptr);
      this._setInstance(o, e);
    });
  }
  separate(r, e) {
    return this.useException((o) => {
      let g, p = K.Undefined;
      if (typeof r == "number" && e !== void 0)
        p = r, g = e;
      else if (typeof r == "function")
        g = r;
      else
        throw new Z("invalid arguments");
      const h = l._api._MagickImage_Separate(this._instance, p, o.ptr);
      return Me._createFromImages(h, this._settings)._use(g);
    });
  }
  sepiaTone(r = new ie(80)) {
    this.useException((e) => {
      const o = typeof r == "number" ? new ie(r) : r, g = l._api._MagickImage_SepiaTone(this._instance, o._toQuantum(), e.ptr);
      this._setInstance(g, e);
    });
  }
  setArtifact(r, e) {
    let o;
    typeof e == "string" ? o = e : typeof e == "boolean" ? o = this.fromBool(e).toString() : o = e.toString(), L(r, (g) => {
      L(o, (p) => {
        l._api._MagickImage_SetArtifact(this._instance, g, p);
      });
    });
  }
  setAttribute(r, e) {
    this.useException((o) => {
      L(r, (g) => {
        L(e, (p) => {
          l._api._MagickImage_SetAttribute(this._instance, g, p, o.ptr);
        });
      });
    });
  }
  setProfile(r, e) {
    const o = typeof r == "string" ? r : r.name;
    let g;
    e !== void 0 ? g = e : typeof r != "string" && (g = r.data), this.useException((p) => {
      L(o, (h) => {
        cr(g, (S) => {
          l._api._MagickImage_SetProfile(this._instance, h, S, g.byteLength, p.ptr);
        });
      });
    });
  }
  setWriteMask(r) {
    this.useExceptionPointer((e) => {
      l._api._MagickImage_SetWriteMask(this._instance, r._instance, e);
    });
  }
  sharpen(r, e, o) {
    const g = this.valueOrDefault(r, 0), p = this.valueOrDefault(e, 1), h = this.valueOrDefault(o, K.Undefined);
    this.useException((S) => {
      const G = l._api._MagickImage_Sharpen(this._instance, g, p, h, S.ptr);
      this._setInstance(G, S);
    });
  }
  shave(r, e) {
    this.useException((o) => {
      const g = l._api._MagickImage_Shave(this._instance, r, e, o.ptr);
      this._setInstance(g, o);
    });
  }
  sigmoidalContrast(r, e, o) {
    this._sigmoidalContrast(!0, r, e, o);
  }
  solarize(r = new ie(50)) {
    this.useException((e) => {
      const o = typeof r == "number" ? new ie(r) : r;
      l._api._MagickImage_Solarize(this._instance, o._toQuantum(), e.ptr);
    });
  }
  splice(r) {
    gr.use(this, r, (e) => {
      this.useException((o) => {
        const g = l._api._MagickImage_Splice(this._instance, e, o.ptr);
        this._setInstance(g, o);
      });
    });
  }
  statistics(r) {
    const e = this.valueOrDefault(r, K.All);
    return this.useExceptionPointer((o) => {
      const g = l._api._MagickImage_Statistics(this._instance, e, o), p = cn._create(this, g, e);
      return l._api._Statistics_DisposeList(g), p;
    });
  }
  strip() {
    this.useExceptionPointer((r) => {
      l._api._MagickImage_Strip(this._instance, r);
    });
  }
  threshold(r, e) {
    const o = this.valueOrDefault(e, K.Undefined);
    this.useExceptionPointer((g) => {
      l._api._MagickImage_Threshold(this._instance, r._toQuantum(), o, g);
    });
  }
  toString = () => `${this.format} ${this.width}x${this.height} ${this.depth}-bit ${dt[this.colorSpace]}`;
  transparent(r) {
    r._use((e) => {
      this.useExceptionPointer((o) => {
        l._api._MagickImage_Transparent(this._instance, e, 0, o);
      });
    });
  }
  trim(...r) {
    if (r.length > 0)
      if (r.length == 1 && r[0] instanceof ie) {
        const e = r[0];
        this.setArtifact("trim:percent-background", e.toDouble().toString());
      } else {
        const e = r, o = [...new Set(mu(e))].join(",");
        this.setArtifact("trim:edges", o);
      }
    this.useException((e) => {
      const o = l._api._MagickImage_Trim(this._instance, e.ptr);
      this._setInstance(o, e), this.removeArtifact("trim:edges"), this.removeArtifact("trim:percent-background");
    });
  }
  wave(r, e, o) {
    const g = this.valueOrDefault(r, this.interpolate), p = this.valueOrDefault(e, 25), h = this.valueOrDefault(o, 150);
    this.useException((S) => {
      const G = l._api._MagickImage_Wave(this._instance, g, p, h, S.ptr);
      this._setInstance(G, S);
    });
  }
  vignette(r, e, o, g) {
    const p = this.valueOrDefault(r, 0), h = this.valueOrDefault(e, 1), S = this.valueOrDefault(o, 0), G = this.valueOrDefault(g, 0);
    this.useException((C) => {
      const x = l._api._MagickImage_Vignette(this._instance, p, h, S, G, C.ptr);
      this._setInstance(x, C);
    });
  }
  write(r, e) {
    let o = 0, g = 0;
    e !== void 0 ? this._settings.format = r : e = r, this.useException((h) => {
      Ge.use((S) => {
        this._settings._use((G) => {
          try {
            o = l._api._MagickImage_WriteBlob(this._instance, G._instance, S.ptr, h.ptr), g = S.value;
          } catch {
            o !== 0 && (o = l._api._MagickMemory_Relinquish(o));
          }
        });
      });
    });
    const p = new yr(o, g, e);
    return _e._disposeAfterExecution(p, p.func);
  }
  writeToCanvas(r, e) {
    r.width = this.width, r.height = this.height;
    const o = r.getContext("2d", e);
    o !== null && Qe._map(this, "RGBA", (g) => {
      const p = o.createImageData(this.width, this.height);
      let h = 0;
      for (let S = 0; S < this.height; S++)
        for (let G = 0; G < this.width; G++)
          p.data[h++] = l._api.HEAPU8[g++], p.data[h++] = l._api.HEAPU8[g++], p.data[h++] = l._api.HEAPU8[g++], p.data[h++] = l._api.HEAPU8[g++];
      o.putImageData(p, 0, 0);
    });
  }
  /** @internal */
  static _createFromImage(r, e) {
    return new ne(r, e);
  }
  /** @internal */
  _channelOffset(r) {
    return l._api._MagickImage_HasChannel(this._instance, r) ? l._api._MagickImage_ChannelOffset(this._instance, r) : -1;
  }
  /** @internal */
  static _clone(r) {
    return T.usePointer((e) => new ne(l._api._MagickImage_Clone(r._instance, e), r._settings._clone()));
  }
  /** @internal */
  _getSettings() {
    return this._settings;
  }
  /** @internal */
  _instanceNotInitialized() {
    throw new Z("no image has been read");
  }
  /** @internal */
  _setInstance(r, e) {
    if (super._setInstance(r, e) === !0 || r === 0 && this.onProgress !== void 0)
      return !0;
    throw new Z("out of memory");
  }
  _use(r) {
    return _e._disposeAfterExecution(this, r);
  }
  static _create(r) {
    return ne.create()._use(r);
  }
  onDispose() {
    this.disposeProgressDelegate();
  }
  _contrast(r) {
    this.useExceptionPointer((e) => {
      l._api._MagickImage_Contrast(this._instance, this.fromBool(r), e);
    });
  }
  _opaque(r, e, o) {
    this.useExceptionPointer((g) => {
      r._use((p) => {
        e._use((h) => {
          l._api._MagickImage_Opaque(this._instance, p, h, this.fromBool(o), g);
        });
      });
    });
  }
  _sigmoidalContrast(r, e, o, g) {
    let p;
    o !== void 0 ? typeof o == "number" ? p = o : p = o.multiply(Ue.max) : p = Ue.max * 0.5;
    const h = this.valueOrDefault(g, K.Undefined);
    this.useExceptionPointer((S) => {
      l._api._MagickImage_SigmoidalContrast(this._instance, this.fromBool(r), e, p, h, S);
    });
  }
  _transparent(r, e) {
    r._use((o) => {
      this.useExceptionPointer((g) => {
        l._api._MagickImage_Transparent(this._instance, o, this.fromBool(e), g);
      });
    });
  }
  static createInstance() {
    return T.usePointer((r) => l._api._MagickImage_Create(0, r));
  }
  fromBool(r) {
    return r ? 1 : 0;
  }
  disposeProgressDelegate() {
    ae.removeProgressDelegate(this), this._progress = void 0;
  }
  readOrPing(r, e, o, g) {
    this.useException((p) => {
      const h = o instanceof Ie ? o : new Ie(this._settings);
      if (h._ping = r, this._settings._ping = r, typeof e == "string")
        h._fileName = e;
      else if (fr(e)) {
        this.readFromArray(e, h, p);
        return;
      } else
        h._fileName = "xc:" + e.toShortString(), h.width = typeof o == "number" ? o : 0, h.height = typeof g == "number" ? g : 0;
      h._use((S) => {
        const G = l._api._MagickImage_ReadFile(S._instance, p.ptr);
        this._setInstance(G, p);
      });
    });
  }
  readFromArray(r, e, o) {
    e._use((g) => {
      cr(r, (p) => {
        const h = l._api._MagickImage_ReadBlob(g._instance, p, 0, r.byteLength, o.ptr);
        this._setInstance(h, o);
      });
    });
  }
  toBool(r) {
    return r === 1;
  }
  valueOrDefault(r, e) {
    return r === void 0 ? e : r;
  }
  useException(r) {
    return T.use(r, (e) => {
      this.onWarning !== void 0 && this.onWarning(new mr(e));
    });
  }
  useExceptionPointer(r) {
    return T.usePointer(r, (e) => {
      this.onWarning !== void 0 && this.onWarning(new mr(e));
    });
  }
}
var wu = (() => {
  var t = typeof document < "u" && document.currentScript ? document.currentScript.src : void 0;
  return function(r = {}) {
    var e = r, o, g;
    e.ready = new Promise((n, a) => {
      o = n, g = a;
    }), (!globalThis.crypto || !globalThis.crypto.getRandomValues) && (globalThis.crypto = { getRandomValues: (n) => {
      for (let a = 0; a < n.length; a++) n[a] = Math.random() * 256 | 0;
    } });
    var p = Object.assign({}, e), h = "./this.program", S = (n, a) => {
      throw a;
    }, G = typeof window == "object", C = typeof importScripts == "function";
    typeof process == "object" && typeof process.versions == "object" && process.versions.node;
    var x = "";
    function re(n) {
      return e.locateFile ? e.locateFile(n, x) : x + n;
    }
    var pe, Pe, Re;
    (G || C) && (C ? x = self.location.href : typeof document < "u" && document.currentScript && (x = document.currentScript.src), t && (x = t), x.indexOf("blob:") !== 0 ? x = x.substr(0, x.replace(/[?#].*/, "").lastIndexOf("/") + 1) : x = "", pe = (n) => {
      var a = new XMLHttpRequest();
      return a.open("GET", n, !1), a.send(null), a.responseText;
    }, C && (Re = (n) => {
      var a = new XMLHttpRequest();
      return a.open("GET", n, !1), a.responseType = "arraybuffer", a.send(null), new Uint8Array(a.response);
    }), Pe = (n, a, i) => {
      var s = new XMLHttpRequest();
      s.open("GET", n, !0), s.responseType = "arraybuffer", s.onload = () => {
        if (s.status == 200 || s.status == 0 && s.response) {
          a(s.response);
          return;
        }
        i();
      }, s.onerror = i, s.send(null);
    });
    var Je = e.print || console.log.bind(console), Ae = e.printErr || console.error.bind(console);
    Object.assign(e, p), p = null, e.arguments && e.arguments, e.thisProgram && (h = e.thisProgram), e.quit && (S = e.quit);
    var Ke;
    e.wasmBinary && (Ke = e.wasmBinary);
    var br = e.noExitRuntime || !0;
    typeof WebAssembly != "object" && de("no native wasm support detected");
    var ht, zt = !1;
    function Pr(n, a) {
      n || de(a);
    }
    var V, te, se, Ze, b, W, yt, ue, gn, wt;
    function mn() {
      var n = ht.buffer;
      e.HEAP8 = V = new Int8Array(n), e.HEAP16 = se = new Int16Array(n), e.HEAP32 = b = new Int32Array(n), e.HEAPU8 = te = new Uint8Array(n), e.HEAPU16 = Ze = new Uint16Array(n), e.HEAPU32 = W = new Uint32Array(n), e.HEAPF32 = yt = new Float32Array(n), e.HEAPF64 = wt = new Float64Array(n), e.HEAP64 = ue = new BigInt64Array(n), e.HEAPU64 = gn = new BigUint64Array(n);
    }
    var Ce, fn = [], pn = [], dn = [], Ar = 0;
    function Er() {
      return br || Ar > 0;
    }
    function Tr() {
      if (e.preRun)
        for (typeof e.preRun == "function" && (e.preRun = [e.preRun]); e.preRun.length; )
          Wr(e.preRun.shift());
      Ht(fn);
    }
    function Rr() {
      !e.noFSInit && !_.init.initialized && _.init(), _.ignorePermissions = !1, Ht(pn);
    }
    function Cr() {
      if (e.postRun)
        for (typeof e.postRun == "function" && (e.postRun = [e.postRun]); e.postRun.length; )
          Lr(e.postRun.shift());
      Ht(dn);
    }
    function Wr(n) {
      fn.unshift(n);
    }
    function Br(n) {
      pn.unshift(n);
    }
    function Lr(n) {
      dn.unshift(n);
    }
    var We = 0, Oe = null;
    function io(n) {
      return n;
    }
    function Nt(n) {
      We++, e.monitorRunDependencies && e.monitorRunDependencies(We);
    }
    function St(n) {
      if (We--, e.monitorRunDependencies && e.monitorRunDependencies(We), We == 0 && Oe) {
        var a = Oe;
        Oe = null, a();
      }
    }
    function de(n) {
      e.onAbort && e.onAbort(n), n = "Aborted(" + n + ")", Ae(n), zt = !0, n += ". Build with -sASSERTIONS for more info.";
      var a = new WebAssembly.RuntimeError(n);
      throw g(a), a;
    }
    var xr = "data:application/octet-stream;base64,";
    function hn(n) {
      return n.startsWith(xr);
    }
    function yn(n) {
      return n.startsWith("file://");
    }
    var $e;
    $e = "magick.wasm", hn($e) || ($e = re($e));
    function wn(n) {
      try {
        if (n == $e && Ke)
          return new Uint8Array(Ke);
        if (Re)
          return Re(n);
        throw "both async and sync fetching of the wasm failed";
      } catch (a) {
        de(a);
      }
    }
    function zr(n) {
      if (!Ke && (G || C)) {
        if (typeof fetch == "function" && !yn(n))
          return fetch(n, { credentials: "same-origin" }).then((a) => {
            if (!a.ok)
              throw "failed to load wasm binary file at '" + n + "'";
            return a.arrayBuffer();
          }).catch(() => wn(n));
        if (Pe)
          return new Promise((a, i) => {
            Pe(n, (s) => a(new Uint8Array(s)), i);
          });
      }
      return Promise.resolve().then(() => wn(n));
    }
    function Sn(n, a, i) {
      return zr(n).then((s) => WebAssembly.instantiate(s, a)).then((s) => s).then(i, (s) => {
        Ae("failed to asynchronously prepare wasm: " + s), de(s);
      });
    }
    function Nr(n, a, i, s) {
      return !n && typeof WebAssembly.instantiateStreaming == "function" && !hn(a) && !yn(a) && typeof fetch == "function" ? fetch(a, { credentials: "same-origin" }).then((u) => {
        var c = WebAssembly.instantiateStreaming(u, i);
        return c.then(s, function(m) {
          return Ae("wasm streaming compile failed: " + m), Ae("falling back to ArrayBuffer instantiation"), Sn(a, i, s);
        });
      }) : Sn(a, i, s);
    }
    function Hr() {
      var n = { a: Gs };
      function a(s, u) {
        var c = s.exports;
        return e.asm = c, ht = e.asm.ab, mn(), Ce = e.asm.ub, Br(e.asm.bb), St(), c;
      }
      Nt();
      function i(s) {
        a(s.instance);
      }
      if (e.instantiateWasm)
        try {
          return e.instantiateWasm(n, a);
        } catch (s) {
          Ae("Module.instantiateWasm callback failed with error: " + s), g(s);
        }
      return Nr(Ke, $e, n, i).catch(g), {};
    }
    function Ur(n) {
      this.name = "ExitStatus", this.message = `Program terminated with exit(${n})`, this.status = n;
    }
    var Ht = (n) => {
      for (; n.length > 0; )
        n.shift()(e);
    };
    function Fr(n, a = "i8") {
      switch (a.endsWith("*") && (a = "*"), a) {
        case "i1":
          return V[n >>> 0];
        case "i8":
          return V[n >>> 0];
        case "i16":
          return se[n >>> 1];
        case "i32":
          return b[n >>> 2];
        case "i64":
          return ue[n >> 3];
        case "float":
          return yt[n >>> 2];
        case "double":
          return wt[n >>> 3];
        case "*":
          return W[n >>> 2];
        default:
          de(`invalid type for getValue: ${a}`);
      }
    }
    function $r(n, a, i = "i8") {
      switch (i.endsWith("*") && (i = "*"), i) {
        case "i1":
          V[n >>> 0] = a;
          break;
        case "i8":
          V[n >>> 0] = a;
          break;
        case "i16":
          se[n >>> 1] = a;
          break;
        case "i32":
          b[n >>> 2] = a;
          break;
        case "i64":
          ue[n >> 3] = BigInt(a);
          break;
        case "float":
          yt[n >>> 2] = a;
          break;
        case "double":
          wt[n >>> 3] = a;
          break;
        case "*":
          W[n >>> 2] = a;
          break;
        default:
          de(`invalid type for setValue: ${i}`);
      }
    }
    var et = [], z = (n) => {
      var a = et[n];
      return a || (n >= et.length && (et.length = n + 1), et[n] = a = Ce.get(n)), a;
    }, Yr = (n, a) => z(n)(a), Ye = 0;
    function kn(n) {
      this.excPtr = n, this.ptr = n - 24, this.set_type = function(a) {
        W[this.ptr + 4 >>> 2] = a;
      }, this.get_type = function() {
        return W[this.ptr + 4 >>> 2];
      }, this.set_destructor = function(a) {
        W[this.ptr + 8 >>> 2] = a;
      }, this.get_destructor = function() {
        return W[this.ptr + 8 >>> 2];
      }, this.set_caught = function(a) {
        a = a ? 1 : 0, V[this.ptr + 12 >>> 0] = a;
      }, this.get_caught = function() {
        return V[this.ptr + 12 >>> 0] != 0;
      }, this.set_rethrown = function(a) {
        a = a ? 1 : 0, V[this.ptr + 13 >>> 0] = a;
      }, this.get_rethrown = function() {
        return V[this.ptr + 13 >>> 0] != 0;
      }, this.init = function(a, i) {
        this.set_adjusted_ptr(0), this.set_type(a), this.set_destructor(i);
      }, this.set_adjusted_ptr = function(a) {
        W[this.ptr + 16 >>> 2] = a;
      }, this.get_adjusted_ptr = function() {
        return W[this.ptr + 16 >>> 2];
      }, this.get_exception_ptr = function() {
        var a = ur(this.get_type());
        if (a)
          return W[this.excPtr >>> 2];
        var i = this.get_adjusted_ptr();
        return i !== 0 ? i : this.excPtr;
      };
    }
    function jr(n) {
      throw Ye || (Ye = n), Ye;
    }
    function Xr() {
      var n = Ye;
      if (!n)
        return gt(0), 0;
      var a = new kn(n);
      a.set_adjusted_ptr(n);
      var i = a.get_type();
      if (!i)
        return gt(0), n;
      for (var s = 0; s < arguments.length; s++) {
        var u = arguments[s];
        if (u === 0 || u === i)
          break;
        var c = a.ptr + 16;
        if (sr(u, i, c))
          return gt(u), n;
      }
      return gt(i), n;
    }
    var Vr = Xr;
    function qr(n, a, i) {
      var s = new kn(n);
      throw s.init(a, i), Ye = n, Ye;
    }
    var Y = { isAbs: (n) => n.charAt(0) === "/", splitPath: (n) => {
      var a = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
      return a.exec(n).slice(1);
    }, normalizeArray: (n, a) => {
      for (var i = 0, s = n.length - 1; s >= 0; s--) {
        var u = n[s];
        u === "." ? n.splice(s, 1) : u === ".." ? (n.splice(s, 1), i++) : i && (n.splice(s, 1), i--);
      }
      if (a)
        for (; i; i--)
          n.unshift("..");
      return n;
    }, normalize: (n) => {
      var a = Y.isAbs(n), i = n.substr(-1) === "/";
      return n = Y.normalizeArray(n.split("/").filter((s) => !!s), !a).join("/"), !n && !a && (n = "."), n && i && (n += "/"), (a ? "/" : "") + n;
    }, dirname: (n) => {
      var a = Y.splitPath(n), i = a[0], s = a[1];
      return !i && !s ? "." : (s && (s = s.substr(0, s.length - 1)), i + s);
    }, basename: (n) => {
      if (n === "/") return "/";
      n = Y.normalize(n), n = n.replace(/\/$/, "");
      var a = n.lastIndexOf("/");
      return a === -1 ? n : n.substr(a + 1);
    }, join: function() {
      var n = Array.prototype.slice.call(arguments);
      return Y.normalize(n.join("/"));
    }, join2: (n, a) => Y.normalize(n + "/" + a) }, Qr = () => {
      if (typeof crypto == "object" && typeof crypto.getRandomValues == "function")
        return (n) => crypto.getRandomValues(n);
      de("initRandomDevice");
    }, Ut = (n) => (Ut = Qr())(n), he = { resolve: function() {
      for (var n = "", a = !1, i = arguments.length - 1; i >= -1 && !a; i--) {
        var s = i >= 0 ? arguments[i] : _.cwd();
        if (typeof s != "string")
          throw new TypeError("Arguments to path.resolve must be strings");
        if (!s)
          return "";
        n = s + "/" + n, a = Y.isAbs(s);
      }
      return n = Y.normalizeArray(n.split("/").filter((u) => !!u), !a).join("/"), (a ? "/" : "") + n || ".";
    }, relative: (n, a) => {
      n = he.resolve(n).substr(1), a = he.resolve(a).substr(1);
      function i(y) {
        for (var k = 0; k < y.length && y[k] === ""; k++)
          ;
        for (var D = y.length - 1; D >= 0 && y[D] === ""; D--)
          ;
        return k > D ? [] : y.slice(k, D - k + 1);
      }
      for (var s = i(n.split("/")), u = i(a.split("/")), c = Math.min(s.length, u.length), m = c, f = 0; f < c; f++)
        if (s[f] !== u[f]) {
          m = f;
          break;
        }
      for (var d = [], f = m; f < s.length; f++)
        d.push("..");
      return d = d.concat(u.slice(m)), d.join("/");
    } }, Be = (n) => {
      for (var a = 0, i = 0; i < n.length; ++i) {
        var s = n.charCodeAt(i);
        s <= 127 ? a++ : s <= 2047 ? a += 2 : s >= 55296 && s <= 57343 ? (a += 4, ++i) : a += 3;
      }
      return a;
    }, Ft = (n, a, i, s) => {
      if (i >>>= 0, !(s > 0)) return 0;
      for (var u = i, c = i + s - 1, m = 0; m < n.length; ++m) {
        var f = n.charCodeAt(m);
        if (f >= 55296 && f <= 57343) {
          var d = n.charCodeAt(++m);
          f = 65536 + ((f & 1023) << 10) | d & 1023;
        }
        if (f <= 127) {
          if (i >= c) break;
          a[i++ >>> 0] = f;
        } else if (f <= 2047) {
          if (i + 1 >= c) break;
          a[i++ >>> 0] = 192 | f >> 6, a[i++ >>> 0] = 128 | f & 63;
        } else if (f <= 65535) {
          if (i + 2 >= c) break;
          a[i++ >>> 0] = 224 | f >> 12, a[i++ >>> 0] = 128 | f >> 6 & 63, a[i++ >>> 0] = 128 | f & 63;
        } else {
          if (i + 3 >= c) break;
          a[i++ >>> 0] = 240 | f >> 18, a[i++ >>> 0] = 128 | f >> 12 & 63, a[i++ >>> 0] = 128 | f >> 6 & 63, a[i++ >>> 0] = 128 | f & 63;
        }
      }
      return a[i >>> 0] = 0, i - u;
    };
    function kt(n, a, i) {
      var s = i > 0 ? i : Be(n) + 1, u = new Array(s), c = Ft(n, u, 0, u.length);
      return a && (u.length = c), u;
    }
    var vn = typeof TextDecoder < "u" ? new TextDecoder("utf8") : void 0, je = (n, a, i) => {
      a >>>= 0;
      for (var s = a + i, u = a; n[u] && !(u >= s); ) ++u;
      if (u - a > 16 && n.buffer && vn)
        return vn.decode(n.subarray(a, u));
      for (var c = ""; a < u; ) {
        var m = n[a++];
        if (!(m & 128)) {
          c += String.fromCharCode(m);
          continue;
        }
        var f = n[a++] & 63;
        if ((m & 224) == 192) {
          c += String.fromCharCode((m & 31) << 6 | f);
          continue;
        }
        var d = n[a++] & 63;
        if ((m & 240) == 224 ? m = (m & 15) << 12 | f << 6 | d : m = (m & 7) << 18 | f << 12 | d << 6 | n[a++] & 63, m < 65536)
          c += String.fromCharCode(m);
        else {
          var y = m - 65536;
          c += String.fromCharCode(55296 | y >> 10, 56320 | y & 1023);
        }
      }
      return c;
    }, Le = { ttys: [], init: function() {
    }, shutdown: function() {
    }, register: function(n, a) {
      Le.ttys[n] = { input: [], output: [], ops: a }, _.registerDevice(n, Le.stream_ops);
    }, stream_ops: { open: function(n) {
      var a = Le.ttys[n.node.rdev];
      if (!a)
        throw new _.ErrnoError(43);
      n.tty = a, n.seekable = !1;
    }, close: function(n) {
      n.tty.ops.fsync(n.tty);
    }, fsync: function(n) {
      n.tty.ops.fsync(n.tty);
    }, read: function(n, a, i, s, u) {
      if (!n.tty || !n.tty.ops.get_char)
        throw new _.ErrnoError(60);
      for (var c = 0, m = 0; m < s; m++) {
        var f;
        try {
          f = n.tty.ops.get_char(n.tty);
        } catch {
          throw new _.ErrnoError(29);
        }
        if (f === void 0 && c === 0)
          throw new _.ErrnoError(6);
        if (f == null) break;
        c++, a[i + m] = f;
      }
      return c && (n.node.timestamp = Date.now()), c;
    }, write: function(n, a, i, s, u) {
      if (!n.tty || !n.tty.ops.put_char)
        throw new _.ErrnoError(60);
      try {
        for (var c = 0; c < s; c++)
          n.tty.ops.put_char(n.tty, a[i + c]);
      } catch {
        throw new _.ErrnoError(29);
      }
      return s && (n.node.timestamp = Date.now()), c;
    } }, default_tty_ops: { get_char: function(n) {
      if (!n.input.length) {
        var a = null;
        if (typeof window < "u" && typeof window.prompt == "function" ? (a = window.prompt("Input: "), a !== null && (a += `
`)) : typeof readline == "function" && (a = readline(), a !== null && (a += `
`)), !a)
          return null;
        n.input = kt(a, !0);
      }
      return n.input.shift();
    }, put_char: function(n, a) {
      a === null || a === 10 ? (Je(je(n.output, 0)), n.output = []) : a != 0 && n.output.push(a);
    }, fsync: function(n) {
      n.output && n.output.length > 0 && (Je(je(n.output, 0)), n.output = []);
    }, ioctl_tcgets: function(n) {
      return { c_iflag: 25856, c_oflag: 5, c_cflag: 191, c_lflag: 35387, c_cc: [3, 28, 127, 21, 4, 0, 1, 0, 17, 19, 26, 0, 18, 15, 23, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] };
    }, ioctl_tcsets: function(n, a, i) {
      return 0;
    }, ioctl_tiocgwinsz: function(n) {
      return [24, 80];
    } }, default_tty1_ops: { put_char: function(n, a) {
      a === null || a === 10 ? (Ae(je(n.output, 0)), n.output = []) : a != 0 && n.output.push(a);
    }, fsync: function(n) {
      n.output && n.output.length > 0 && (Ae(je(n.output, 0)), n.output = []);
    } } }, Jr = (n, a) => (te.fill(0, n, n + a), n), Kr = (n, a) => Math.ceil(n / a) * a, Mn = (n) => {
      n = Kr(n, 65536);
      var a = ir(65536, n);
      return a ? Jr(a, n) : 0;
    }, B = { ops_table: null, mount: function(n) {
      return B.createNode(null, "/", 16895, 0);
    }, createNode: function(n, a, i, s) {
      if (_.isBlkdev(i) || _.isFIFO(i))
        throw new _.ErrnoError(63);
      B.ops_table || (B.ops_table = { dir: { node: { getattr: B.node_ops.getattr, setattr: B.node_ops.setattr, lookup: B.node_ops.lookup, mknod: B.node_ops.mknod, rename: B.node_ops.rename, unlink: B.node_ops.unlink, rmdir: B.node_ops.rmdir, readdir: B.node_ops.readdir, symlink: B.node_ops.symlink }, stream: { llseek: B.stream_ops.llseek } }, file: { node: { getattr: B.node_ops.getattr, setattr: B.node_ops.setattr }, stream: { llseek: B.stream_ops.llseek, read: B.stream_ops.read, write: B.stream_ops.write, allocate: B.stream_ops.allocate, mmap: B.stream_ops.mmap, msync: B.stream_ops.msync } }, link: { node: { getattr: B.node_ops.getattr, setattr: B.node_ops.setattr, readlink: B.node_ops.readlink }, stream: {} }, chrdev: { node: { getattr: B.node_ops.getattr, setattr: B.node_ops.setattr }, stream: _.chrdev_stream_ops } });
      var u = _.createNode(n, a, i, s);
      return _.isDir(u.mode) ? (u.node_ops = B.ops_table.dir.node, u.stream_ops = B.ops_table.dir.stream, u.contents = {}) : _.isFile(u.mode) ? (u.node_ops = B.ops_table.file.node, u.stream_ops = B.ops_table.file.stream, u.usedBytes = 0, u.contents = null) : _.isLink(u.mode) ? (u.node_ops = B.ops_table.link.node, u.stream_ops = B.ops_table.link.stream) : _.isChrdev(u.mode) && (u.node_ops = B.ops_table.chrdev.node, u.stream_ops = B.ops_table.chrdev.stream), u.timestamp = Date.now(), n && (n.contents[a] = u, n.timestamp = u.timestamp), u;
    }, getFileDataAsTypedArray: function(n) {
      return n.contents ? n.contents.subarray ? n.contents.subarray(0, n.usedBytes) : new Uint8Array(n.contents) : new Uint8Array(0);
    }, expandFileStorage: function(n, a) {
      a >>>= 0;
      var i = n.contents ? n.contents.length : 0;
      if (!(i >= a)) {
        var s = 1024 * 1024;
        a = Math.max(a, i * (i < s ? 2 : 1.125) >>> 0), i != 0 && (a = Math.max(a, 256));
        var u = n.contents;
        n.contents = new Uint8Array(a), n.usedBytes > 0 && n.contents.set(u.subarray(0, n.usedBytes), 0);
      }
    }, resizeFileStorage: function(n, a) {
      if (a >>>= 0, n.usedBytes != a)
        if (a == 0)
          n.contents = null, n.usedBytes = 0;
        else {
          var i = n.contents;
          n.contents = new Uint8Array(a), i && n.contents.set(i.subarray(0, Math.min(a, n.usedBytes))), n.usedBytes = a;
        }
    }, node_ops: { getattr: function(n) {
      var a = {};
      return a.dev = _.isChrdev(n.mode) ? n.id : 1, a.ino = n.id, a.mode = n.mode, a.nlink = 1, a.uid = 0, a.gid = 0, a.rdev = n.rdev, _.isDir(n.mode) ? a.size = 4096 : _.isFile(n.mode) ? a.size = n.usedBytes : _.isLink(n.mode) ? a.size = n.link.length : a.size = 0, a.atime = new Date(n.timestamp), a.mtime = new Date(n.timestamp), a.ctime = new Date(n.timestamp), a.blksize = 4096, a.blocks = Math.ceil(a.size / a.blksize), a;
    }, setattr: function(n, a) {
      a.mode !== void 0 && (n.mode = a.mode), a.timestamp !== void 0 && (n.timestamp = a.timestamp), a.size !== void 0 && B.resizeFileStorage(n, a.size);
    }, lookup: function(n, a) {
      throw _.genericErrors[44];
    }, mknod: function(n, a, i, s) {
      return B.createNode(n, a, i, s);
    }, rename: function(n, a, i) {
      if (_.isDir(n.mode)) {
        var s;
        try {
          s = _.lookupNode(a, i);
        } catch {
        }
        if (s)
          for (var u in s.contents)
            throw new _.ErrnoError(55);
      }
      delete n.parent.contents[n.name], n.parent.timestamp = Date.now(), n.name = i, a.contents[i] = n, a.timestamp = n.parent.timestamp, n.parent = a;
    }, unlink: function(n, a) {
      delete n.contents[a], n.timestamp = Date.now();
    }, rmdir: function(n, a) {
      var i = _.lookupNode(n, a);
      for (var s in i.contents)
        throw new _.ErrnoError(55);
      delete n.contents[a], n.timestamp = Date.now();
    }, readdir: function(n) {
      var a = [".", ".."];
      for (var i in n.contents)
        n.contents.hasOwnProperty(i) && a.push(i);
      return a;
    }, symlink: function(n, a, i) {
      var s = B.createNode(n, a, 41471, 0);
      return s.link = i, s;
    }, readlink: function(n) {
      if (!_.isLink(n.mode))
        throw new _.ErrnoError(28);
      return n.link;
    } }, stream_ops: { read: function(n, a, i, s, u) {
      var c = n.node.contents;
      if (u >= n.node.usedBytes) return 0;
      var m = Math.min(n.node.usedBytes - u, s);
      if (m > 8 && c.subarray)
        a.set(c.subarray(u, u + m), i);
      else
        for (var f = 0; f < m; f++) a[i + f] = c[u + f];
      return m;
    }, write: function(n, a, i, s, u, c) {
      if (a.buffer === V.buffer && (c = !1), !s) return 0;
      var m = n.node;
      if (m.timestamp = Date.now(), a.subarray && (!m.contents || m.contents.subarray)) {
        if (c)
          return m.contents = a.subarray(i, i + s), m.usedBytes = s, s;
        if (m.usedBytes === 0 && u === 0)
          return m.contents = a.slice(i, i + s), m.usedBytes = s, s;
        if (u + s <= m.usedBytes)
          return m.contents.set(a.subarray(i, i + s), u), s;
      }
      if (B.expandFileStorage(m, u + s), m.contents.subarray && a.subarray)
        m.contents.set(a.subarray(i, i + s), u);
      else
        for (var f = 0; f < s; f++)
          m.contents[u + f] = a[i + f];
      return m.usedBytes = Math.max(m.usedBytes, u + s), s;
    }, llseek: function(n, a, i) {
      var s = a;
      if (i === 1 ? s += n.position : i === 2 && _.isFile(n.node.mode) && (s += n.node.usedBytes), s < 0)
        throw new _.ErrnoError(28);
      return s;
    }, allocate: function(n, a, i) {
      B.expandFileStorage(n.node, a + i), n.node.usedBytes = Math.max(n.node.usedBytes, a + i);
    }, mmap: function(n, a, i, s, u) {
      if (!_.isFile(n.node.mode))
        throw new _.ErrnoError(43);
      var c, m, f = n.node.contents;
      if (!(u & 2) && f.buffer === V.buffer)
        m = !1, c = f.byteOffset;
      else {
        if ((i > 0 || i + a < f.length) && (f.subarray ? f = f.subarray(i, i + a) : f = Array.prototype.slice.call(f, i, i + a)), m = !0, c = Mn(a), !c)
          throw new _.ErrnoError(48);
        c >>>= 0, V.set(f, c >>> 0);
      }
      return { ptr: c, allocated: m };
    }, msync: function(n, a, i, s, u) {
      return B.stream_ops.write(n, a, 0, s, i, !1), 0;
    } } }, Zr = (n, a, i, s) => {
      var u = s ? "" : `al ${n}`;
      Pe(n, (c) => {
        Pr(c, `Loading data file "${n}" failed (no arrayBuffer).`), a(new Uint8Array(c)), u && St();
      }, (c) => {
        if (i)
          i();
        else
          throw `Loading data file "${n}" failed.`;
      }), u && Nt();
    }, Or = e.preloadPlugins || [];
    function ea(n, a, i, s) {
      typeof Browser < "u" && Browser.init();
      var u = !1;
      return Or.forEach(function(c) {
        u || c.canHandle(a) && (c.handle(n, a, i, s), u = !0);
      }), u;
    }
    function ta(n, a, i, s, u, c, m, f, d, y) {
      var k = a ? he.resolve(Y.join2(n, a)) : n;
      function D(M) {
        function I(R) {
          y && y(), f || _.createDataFile(n, a, R, s, u, d), c && c(), St();
        }
        ea(M, k, I, () => {
          m && m(), St();
        }) || I(M);
      }
      Nt(), typeof i == "string" ? Zr(i, (M) => D(M), m) : D(i);
    }
    function na(n) {
      var a = { r: 0, "r+": 2, w: 577, "w+": 578, a: 1089, "a+": 1090 }, i = a[n];
      if (typeof i > "u")
        throw new Error(`Unknown file open mode: ${n}`);
      return i;
    }
    function $t(n, a) {
      var i = 0;
      return n && (i |= 365), a && (i |= 146), i;
    }
    var _ = { root: null, mounts: [], devices: {}, streams: [], nextInode: 1, nameTable: null, currentPath: "/", initialized: !1, ignorePermissions: !0, ErrnoError: null, genericErrors: {}, filesystems: null, syncFSRequests: 0, lookupPath: (n, a = {}) => {
      if (n = he.resolve(n), !n) return { path: "", node: null };
      var i = { follow_mount: !0, recurse_count: 0 };
      if (a = Object.assign(i, a), a.recurse_count > 8)
        throw new _.ErrnoError(32);
      for (var s = n.split("/").filter((D) => !!D), u = _.root, c = "/", m = 0; m < s.length; m++) {
        var f = m === s.length - 1;
        if (f && a.parent)
          break;
        if (u = _.lookupNode(u, s[m]), c = Y.join2(c, s[m]), _.isMountpoint(u) && (!f || f && a.follow_mount) && (u = u.mounted.root), !f || a.follow)
          for (var d = 0; _.isLink(u.mode); ) {
            var y = _.readlink(c);
            c = he.resolve(Y.dirname(c), y);
            var k = _.lookupPath(c, { recurse_count: a.recurse_count + 1 });
            if (u = k.node, d++ > 40)
              throw new _.ErrnoError(32);
          }
      }
      return { path: c, node: u };
    }, getPath: (n) => {
      for (var a; ; ) {
        if (_.isRoot(n)) {
          var i = n.mount.mountpoint;
          return a ? i[i.length - 1] !== "/" ? `${i}/${a}` : i + a : i;
        }
        a = a ? `${n.name}/${a}` : n.name, n = n.parent;
      }
    }, hashName: (n, a) => {
      for (var i = 0, s = 0; s < a.length; s++)
        i = (i << 5) - i + a.charCodeAt(s) | 0;
      return (n + i >>> 0) % _.nameTable.length;
    }, hashAddNode: (n) => {
      var a = _.hashName(n.parent.id, n.name);
      n.name_next = _.nameTable[a], _.nameTable[a] = n;
    }, hashRemoveNode: (n) => {
      var a = _.hashName(n.parent.id, n.name);
      if (_.nameTable[a] === n)
        _.nameTable[a] = n.name_next;
      else
        for (var i = _.nameTable[a]; i; ) {
          if (i.name_next === n) {
            i.name_next = n.name_next;
            break;
          }
          i = i.name_next;
        }
    }, lookupNode: (n, a) => {
      var i = _.mayLookup(n);
      if (i)
        throw new _.ErrnoError(i, n);
      for (var s = _.hashName(n.id, a), u = _.nameTable[s]; u; u = u.name_next) {
        var c = u.name;
        if (u.parent.id === n.id && c === a)
          return u;
      }
      return _.lookup(n, a);
    }, createNode: (n, a, i, s) => {
      var u = new _.FSNode(n, a, i, s);
      return _.hashAddNode(u), u;
    }, destroyNode: (n) => {
      _.hashRemoveNode(n);
    }, isRoot: (n) => n === n.parent, isMountpoint: (n) => !!n.mounted, isFile: (n) => (n & 61440) === 32768, isDir: (n) => (n & 61440) === 16384, isLink: (n) => (n & 61440) === 40960, isChrdev: (n) => (n & 61440) === 8192, isBlkdev: (n) => (n & 61440) === 24576, isFIFO: (n) => (n & 61440) === 4096, isSocket: (n) => (n & 49152) === 49152, flagsToPermissionString: (n) => {
      var a = ["r", "w", "rw"][n & 3];
      return n & 512 && (a += "w"), a;
    }, nodePermissions: (n, a) => _.ignorePermissions ? 0 : a.includes("r") && !(n.mode & 292) || a.includes("w") && !(n.mode & 146) || a.includes("x") && !(n.mode & 73) ? 2 : 0, mayLookup: (n) => {
      var a = _.nodePermissions(n, "x");
      return a || (n.node_ops.lookup ? 0 : 2);
    }, mayCreate: (n, a) => {
      try {
        var i = _.lookupNode(n, a);
        return 20;
      } catch {
      }
      return _.nodePermissions(n, "wx");
    }, mayDelete: (n, a, i) => {
      var s;
      try {
        s = _.lookupNode(n, a);
      } catch (c) {
        return c.errno;
      }
      var u = _.nodePermissions(n, "wx");
      if (u)
        return u;
      if (i) {
        if (!_.isDir(s.mode))
          return 54;
        if (_.isRoot(s) || _.getPath(s) === _.cwd())
          return 10;
      } else if (_.isDir(s.mode))
        return 31;
      return 0;
    }, mayOpen: (n, a) => n ? _.isLink(n.mode) ? 32 : _.isDir(n.mode) && (_.flagsToPermissionString(a) !== "r" || a & 512) ? 31 : _.nodePermissions(n, _.flagsToPermissionString(a)) : 44, MAX_OPEN_FDS: 4096, nextfd: () => {
      for (var n = 0; n <= _.MAX_OPEN_FDS; n++)
        if (!_.streams[n])
          return n;
      throw new _.ErrnoError(33);
    }, getStreamChecked: (n) => {
      var a = _.getStream(n);
      if (!a)
        throw new _.ErrnoError(8);
      return a;
    }, getStream: (n) => _.streams[n], createStream: (n, a = -1) => (_.FSStream || (_.FSStream = function() {
      this.shared = {};
    }, _.FSStream.prototype = {}, Object.defineProperties(_.FSStream.prototype, { object: { get: function() {
      return this.node;
    }, set: function(i) {
      this.node = i;
    } }, isRead: { get: function() {
      return (this.flags & 2097155) !== 1;
    } }, isWrite: { get: function() {
      return (this.flags & 2097155) !== 0;
    } }, isAppend: { get: function() {
      return this.flags & 1024;
    } }, flags: { get: function() {
      return this.shared.flags;
    }, set: function(i) {
      this.shared.flags = i;
    } }, position: { get: function() {
      return this.shared.position;
    }, set: function(i) {
      this.shared.position = i;
    } } })), n = Object.assign(new _.FSStream(), n), a == -1 && (a = _.nextfd()), n.fd = a, _.streams[a] = n, n), closeStream: (n) => {
      _.streams[n] = null;
    }, chrdev_stream_ops: { open: (n) => {
      var a = _.getDevice(n.node.rdev);
      n.stream_ops = a.stream_ops, n.stream_ops.open && n.stream_ops.open(n);
    }, llseek: () => {
      throw new _.ErrnoError(70);
    } }, major: (n) => n >> 8, minor: (n) => n & 255, makedev: (n, a) => n << 8 | a, registerDevice: (n, a) => {
      _.devices[n] = { stream_ops: a };
    }, getDevice: (n) => _.devices[n], getMounts: (n) => {
      for (var a = [], i = [n]; i.length; ) {
        var s = i.pop();
        a.push(s), i.push.apply(i, s.mounts);
      }
      return a;
    }, syncfs: (n, a) => {
      typeof n == "function" && (a = n, n = !1), _.syncFSRequests++, _.syncFSRequests > 1 && Ae(`warning: ${_.syncFSRequests} FS.syncfs operations in flight at once, probably just doing extra work`);
      var i = _.getMounts(_.root.mount), s = 0;
      function u(m) {
        return _.syncFSRequests--, a(m);
      }
      function c(m) {
        if (m)
          return c.errored ? void 0 : (c.errored = !0, u(m));
        ++s >= i.length && u(null);
      }
      i.forEach((m) => {
        if (!m.type.syncfs)
          return c(null);
        m.type.syncfs(m, n, c);
      });
    }, mount: (n, a, i) => {
      var s = i === "/", u = !i, c;
      if (s && _.root)
        throw new _.ErrnoError(10);
      if (!s && !u) {
        var m = _.lookupPath(i, { follow_mount: !1 });
        if (i = m.path, c = m.node, _.isMountpoint(c))
          throw new _.ErrnoError(10);
        if (!_.isDir(c.mode))
          throw new _.ErrnoError(54);
      }
      var f = { type: n, opts: a, mountpoint: i, mounts: [] }, d = n.mount(f);
      return d.mount = f, f.root = d, s ? _.root = d : c && (c.mounted = f, c.mount && c.mount.mounts.push(f)), d;
    }, unmount: (n) => {
      var a = _.lookupPath(n, { follow_mount: !1 });
      if (!_.isMountpoint(a.node))
        throw new _.ErrnoError(28);
      var i = a.node, s = i.mounted, u = _.getMounts(s);
      Object.keys(_.nameTable).forEach((m) => {
        for (var f = _.nameTable[m]; f; ) {
          var d = f.name_next;
          u.includes(f.mount) && _.destroyNode(f), f = d;
        }
      }), i.mounted = null;
      var c = i.mount.mounts.indexOf(s);
      i.mount.mounts.splice(c, 1);
    }, lookup: (n, a) => n.node_ops.lookup(n, a), mknod: (n, a, i) => {
      var s = _.lookupPath(n, { parent: !0 }), u = s.node, c = Y.basename(n);
      if (!c || c === "." || c === "..")
        throw new _.ErrnoError(28);
      var m = _.mayCreate(u, c);
      if (m)
        throw new _.ErrnoError(m);
      if (!u.node_ops.mknod)
        throw new _.ErrnoError(63);
      return u.node_ops.mknod(u, c, a, i);
    }, create: (n, a) => (a = a !== void 0 ? a : 438, a &= 4095, a |= 32768, _.mknod(n, a, 0)), mkdir: (n, a) => (a = a !== void 0 ? a : 511, a &= 1023, a |= 16384, _.mknod(n, a, 0)), mkdirTree: (n, a) => {
      for (var i = n.split("/"), s = "", u = 0; u < i.length; ++u)
        if (i[u]) {
          s += "/" + i[u];
          try {
            _.mkdir(s, a);
          } catch (c) {
            if (c.errno != 20) throw c;
          }
        }
    }, mkdev: (n, a, i) => (typeof i > "u" && (i = a, a = 438), a |= 8192, _.mknod(n, a, i)), symlink: (n, a) => {
      if (!he.resolve(n))
        throw new _.ErrnoError(44);
      var i = _.lookupPath(a, { parent: !0 }), s = i.node;
      if (!s)
        throw new _.ErrnoError(44);
      var u = Y.basename(a), c = _.mayCreate(s, u);
      if (c)
        throw new _.ErrnoError(c);
      if (!s.node_ops.symlink)
        throw new _.ErrnoError(63);
      return s.node_ops.symlink(s, u, n);
    }, rename: (n, a) => {
      var i = Y.dirname(n), s = Y.dirname(a), u = Y.basename(n), c = Y.basename(a), m, f, d;
      if (m = _.lookupPath(n, { parent: !0 }), f = m.node, m = _.lookupPath(a, { parent: !0 }), d = m.node, !f || !d) throw new _.ErrnoError(44);
      if (f.mount !== d.mount)
        throw new _.ErrnoError(75);
      var y = _.lookupNode(f, u), k = he.relative(n, s);
      if (k.charAt(0) !== ".")
        throw new _.ErrnoError(28);
      if (k = he.relative(a, i), k.charAt(0) !== ".")
        throw new _.ErrnoError(55);
      var D;
      try {
        D = _.lookupNode(d, c);
      } catch {
      }
      if (y !== D) {
        var M = _.isDir(y.mode), I = _.mayDelete(f, u, M);
        if (I)
          throw new _.ErrnoError(I);
        if (I = D ? _.mayDelete(d, c, M) : _.mayCreate(d, c), I)
          throw new _.ErrnoError(I);
        if (!f.node_ops.rename)
          throw new _.ErrnoError(63);
        if (_.isMountpoint(y) || D && _.isMountpoint(D))
          throw new _.ErrnoError(10);
        if (d !== f && (I = _.nodePermissions(f, "w"), I))
          throw new _.ErrnoError(I);
        _.hashRemoveNode(y);
        try {
          f.node_ops.rename(y, d, c);
        } catch (R) {
          throw R;
        } finally {
          _.hashAddNode(y);
        }
      }
    }, rmdir: (n) => {
      var a = _.lookupPath(n, { parent: !0 }), i = a.node, s = Y.basename(n), u = _.lookupNode(i, s), c = _.mayDelete(i, s, !0);
      if (c)
        throw new _.ErrnoError(c);
      if (!i.node_ops.rmdir)
        throw new _.ErrnoError(63);
      if (_.isMountpoint(u))
        throw new _.ErrnoError(10);
      i.node_ops.rmdir(i, s), _.destroyNode(u);
    }, readdir: (n) => {
      var a = _.lookupPath(n, { follow: !0 }), i = a.node;
      if (!i.node_ops.readdir)
        throw new _.ErrnoError(54);
      return i.node_ops.readdir(i);
    }, unlink: (n) => {
      var a = _.lookupPath(n, { parent: !0 }), i = a.node;
      if (!i)
        throw new _.ErrnoError(44);
      var s = Y.basename(n), u = _.lookupNode(i, s), c = _.mayDelete(i, s, !1);
      if (c)
        throw new _.ErrnoError(c);
      if (!i.node_ops.unlink)
        throw new _.ErrnoError(63);
      if (_.isMountpoint(u))
        throw new _.ErrnoError(10);
      i.node_ops.unlink(i, s), _.destroyNode(u);
    }, readlink: (n) => {
      var a = _.lookupPath(n), i = a.node;
      if (!i)
        throw new _.ErrnoError(44);
      if (!i.node_ops.readlink)
        throw new _.ErrnoError(28);
      return he.resolve(_.getPath(i.parent), i.node_ops.readlink(i));
    }, stat: (n, a) => {
      var i = _.lookupPath(n, { follow: !a }), s = i.node;
      if (!s)
        throw new _.ErrnoError(44);
      if (!s.node_ops.getattr)
        throw new _.ErrnoError(63);
      return s.node_ops.getattr(s);
    }, lstat: (n) => _.stat(n, !0), chmod: (n, a, i) => {
      var s;
      if (typeof n == "string") {
        var u = _.lookupPath(n, { follow: !i });
        s = u.node;
      } else
        s = n;
      if (!s.node_ops.setattr)
        throw new _.ErrnoError(63);
      s.node_ops.setattr(s, { mode: a & 4095 | s.mode & -4096, timestamp: Date.now() });
    }, lchmod: (n, a) => {
      _.chmod(n, a, !0);
    }, fchmod: (n, a) => {
      var i = _.getStreamChecked(n);
      _.chmod(i.node, a);
    }, chown: (n, a, i, s) => {
      var u;
      if (typeof n == "string") {
        var c = _.lookupPath(n, { follow: !s });
        u = c.node;
      } else
        u = n;
      if (!u.node_ops.setattr)
        throw new _.ErrnoError(63);
      u.node_ops.setattr(u, { timestamp: Date.now() });
    }, lchown: (n, a, i) => {
      _.chown(n, a, i, !0);
    }, fchown: (n, a, i) => {
      var s = _.getStreamChecked(n);
      _.chown(s.node, a, i);
    }, truncate: (n, a) => {
      if (a < 0)
        throw new _.ErrnoError(28);
      var i;
      if (typeof n == "string") {
        var s = _.lookupPath(n, { follow: !0 });
        i = s.node;
      } else
        i = n;
      if (!i.node_ops.setattr)
        throw new _.ErrnoError(63);
      if (_.isDir(i.mode))
        throw new _.ErrnoError(31);
      if (!_.isFile(i.mode))
        throw new _.ErrnoError(28);
      var u = _.nodePermissions(i, "w");
      if (u)
        throw new _.ErrnoError(u);
      i.node_ops.setattr(i, { size: a, timestamp: Date.now() });
    }, ftruncate: (n, a) => {
      var i = _.getStreamChecked(n);
      if (!(i.flags & 2097155))
        throw new _.ErrnoError(28);
      _.truncate(i.node, a);
    }, utime: (n, a, i) => {
      var s = _.lookupPath(n, { follow: !0 }), u = s.node;
      u.node_ops.setattr(u, { timestamp: Math.max(a, i) });
    }, open: (n, a, i) => {
      if (n === "")
        throw new _.ErrnoError(44);
      a = typeof a == "string" ? na(a) : a, i = typeof i > "u" ? 438 : i, a & 64 ? i = i & 4095 | 32768 : i = 0;
      var s;
      if (typeof n == "object")
        s = n;
      else {
        n = Y.normalize(n);
        try {
          var u = _.lookupPath(n, { follow: !(a & 131072) });
          s = u.node;
        } catch {
        }
      }
      var c = !1;
      if (a & 64)
        if (s) {
          if (a & 128)
            throw new _.ErrnoError(20);
        } else
          s = _.mknod(n, i, 0), c = !0;
      if (!s)
        throw new _.ErrnoError(44);
      if (_.isChrdev(s.mode) && (a &= -513), a & 65536 && !_.isDir(s.mode))
        throw new _.ErrnoError(54);
      if (!c) {
        var m = _.mayOpen(s, a);
        if (m)
          throw new _.ErrnoError(m);
      }
      a & 512 && !c && _.truncate(s, 0), a &= -131713;
      var f = _.createStream({ node: s, path: _.getPath(s), flags: a, seekable: !0, position: 0, stream_ops: s.stream_ops, ungotten: [], error: !1 });
      return f.stream_ops.open && f.stream_ops.open(f), e.logReadFiles && !(a & 1) && (_.readFiles || (_.readFiles = {}), n in _.readFiles || (_.readFiles[n] = 1)), f;
    }, close: (n) => {
      if (_.isClosed(n))
        throw new _.ErrnoError(8);
      n.getdents && (n.getdents = null);
      try {
        n.stream_ops.close && n.stream_ops.close(n);
      } catch (a) {
        throw a;
      } finally {
        _.closeStream(n.fd);
      }
      n.fd = null;
    }, isClosed: (n) => n.fd === null, llseek: (n, a, i) => {
      if (_.isClosed(n))
        throw new _.ErrnoError(8);
      if (!n.seekable || !n.stream_ops.llseek)
        throw new _.ErrnoError(70);
      if (i != 0 && i != 1 && i != 2)
        throw new _.ErrnoError(28);
      return n.position = n.stream_ops.llseek(n, a, i), n.ungotten = [], n.position;
    }, read: (n, a, i, s, u) => {
      if (i >>>= 0, s < 0 || u < 0)
        throw new _.ErrnoError(28);
      if (_.isClosed(n))
        throw new _.ErrnoError(8);
      if ((n.flags & 2097155) === 1)
        throw new _.ErrnoError(8);
      if (_.isDir(n.node.mode))
        throw new _.ErrnoError(31);
      if (!n.stream_ops.read)
        throw new _.ErrnoError(28);
      var c = typeof u < "u";
      if (!c)
        u = n.position;
      else if (!n.seekable)
        throw new _.ErrnoError(70);
      var m = n.stream_ops.read(n, a, i, s, u);
      return c || (n.position += m), m;
    }, write: (n, a, i, s, u, c) => {
      if (i >>>= 0, s < 0 || u < 0)
        throw new _.ErrnoError(28);
      if (_.isClosed(n))
        throw new _.ErrnoError(8);
      if (!(n.flags & 2097155))
        throw new _.ErrnoError(8);
      if (_.isDir(n.node.mode))
        throw new _.ErrnoError(31);
      if (!n.stream_ops.write)
        throw new _.ErrnoError(28);
      n.seekable && n.flags & 1024 && _.llseek(n, 0, 2);
      var m = typeof u < "u";
      if (!m)
        u = n.position;
      else if (!n.seekable)
        throw new _.ErrnoError(70);
      var f = n.stream_ops.write(n, a, i, s, u, c);
      return m || (n.position += f), f;
    }, allocate: (n, a, i) => {
      if (_.isClosed(n))
        throw new _.ErrnoError(8);
      if (a < 0 || i <= 0)
        throw new _.ErrnoError(28);
      if (!(n.flags & 2097155))
        throw new _.ErrnoError(8);
      if (!_.isFile(n.node.mode) && !_.isDir(n.node.mode))
        throw new _.ErrnoError(43);
      if (!n.stream_ops.allocate)
        throw new _.ErrnoError(138);
      n.stream_ops.allocate(n, a, i);
    }, mmap: (n, a, i, s, u) => {
      if (s & 2 && !(u & 2) && (n.flags & 2097155) !== 2)
        throw new _.ErrnoError(2);
      if ((n.flags & 2097155) === 1)
        throw new _.ErrnoError(2);
      if (!n.stream_ops.mmap)
        throw new _.ErrnoError(43);
      return n.stream_ops.mmap(n, a, i, s, u);
    }, msync: (n, a, i, s, u) => (i >>>= 0, n.stream_ops.msync ? n.stream_ops.msync(n, a, i, s, u) : 0), munmap: (n) => 0, ioctl: (n, a, i) => {
      if (!n.stream_ops.ioctl)
        throw new _.ErrnoError(59);
      return n.stream_ops.ioctl(n, a, i);
    }, readFile: (n, a = {}) => {
      if (a.flags = a.flags || 0, a.encoding = a.encoding || "binary", a.encoding !== "utf8" && a.encoding !== "binary")
        throw new Error(`Invalid encoding type "${a.encoding}"`);
      var i, s = _.open(n, a.flags), u = _.stat(n), c = u.size, m = new Uint8Array(c);
      return _.read(s, m, 0, c, 0), a.encoding === "utf8" ? i = je(m, 0) : a.encoding === "binary" && (i = m), _.close(s), i;
    }, writeFile: (n, a, i = {}) => {
      i.flags = i.flags || 577;
      var s = _.open(n, i.flags, i.mode);
      if (typeof a == "string") {
        var u = new Uint8Array(Be(a) + 1), c = Ft(a, u, 0, u.length);
        _.write(s, u, 0, c, void 0, i.canOwn);
      } else if (ArrayBuffer.isView(a))
        _.write(s, a, 0, a.byteLength, void 0, i.canOwn);
      else
        throw new Error("Unsupported data type");
      _.close(s);
    }, cwd: () => _.currentPath, chdir: (n) => {
      var a = _.lookupPath(n, { follow: !0 });
      if (a.node === null)
        throw new _.ErrnoError(44);
      if (!_.isDir(a.node.mode))
        throw new _.ErrnoError(54);
      var i = _.nodePermissions(a.node, "x");
      if (i)
        throw new _.ErrnoError(i);
      _.currentPath = a.path;
    }, createDefaultDirectories: () => {
      _.mkdir("/tmp"), _.mkdir("/home"), _.mkdir("/home/web_user");
    }, createDefaultDevices: () => {
      _.mkdir("/dev"), _.registerDevice(_.makedev(1, 3), { read: () => 0, write: (s, u, c, m, f) => m }), _.mkdev("/dev/null", _.makedev(1, 3)), Le.register(_.makedev(5, 0), Le.default_tty_ops), Le.register(_.makedev(6, 0), Le.default_tty1_ops), _.mkdev("/dev/tty", _.makedev(5, 0)), _.mkdev("/dev/tty1", _.makedev(6, 0));
      var n = new Uint8Array(1024), a = 0, i = () => (a === 0 && (a = Ut(n).byteLength), n[--a]);
      _.createDevice("/dev", "random", i), _.createDevice("/dev", "urandom", i), _.mkdir("/dev/shm"), _.mkdir("/dev/shm/tmp");
    }, createSpecialDirectories: () => {
      _.mkdir("/proc");
      var n = _.mkdir("/proc/self");
      _.mkdir("/proc/self/fd"), _.mount({ mount: () => {
        var a = _.createNode(n, "fd", 16895, 73);
        return a.node_ops = { lookup: (i, s) => {
          var u = +s, c = _.getStreamChecked(u), m = { parent: null, mount: { mountpoint: "fake" }, node_ops: { readlink: () => c.path } };
          return m.parent = m, m;
        } }, a;
      } }, {}, "/proc/self/fd");
    }, createStandardStreams: () => {
      e.stdin ? _.createDevice("/dev", "stdin", e.stdin) : _.symlink("/dev/tty", "/dev/stdin"), e.stdout ? _.createDevice("/dev", "stdout", null, e.stdout) : _.symlink("/dev/tty", "/dev/stdout"), e.stderr ? _.createDevice("/dev", "stderr", null, e.stderr) : _.symlink("/dev/tty1", "/dev/stderr"), _.open("/dev/stdin", 0), _.open("/dev/stdout", 1), _.open("/dev/stderr", 1);
    }, ensureErrnoError: () => {
      _.ErrnoError || (_.ErrnoError = function(a, i) {
        this.name = "ErrnoError", this.node = i, this.setErrno = function(s) {
          this.errno = s;
        }, this.setErrno(a), this.message = "FS error";
      }, _.ErrnoError.prototype = new Error(), _.ErrnoError.prototype.constructor = _.ErrnoError, [44].forEach((n) => {
        _.genericErrors[n] = new _.ErrnoError(n), _.genericErrors[n].stack = "<generic error, no stack>";
      }));
    }, staticInit: () => {
      _.ensureErrnoError(), _.nameTable = new Array(4096), _.mount(B, {}, "/"), _.createDefaultDirectories(), _.createDefaultDevices(), _.createSpecialDirectories(), _.filesystems = { MEMFS: B };
    }, init: (n, a, i) => {
      _.init.initialized = !0, _.ensureErrnoError(), e.stdin = n || e.stdin, e.stdout = a || e.stdout, e.stderr = i || e.stderr, _.createStandardStreams();
    }, quit: () => {
      _.init.initialized = !1;
      for (var n = 0; n < _.streams.length; n++) {
        var a = _.streams[n];
        a && _.close(a);
      }
    }, findObject: (n, a) => {
      var i = _.analyzePath(n, a);
      return i.exists ? i.object : null;
    }, analyzePath: (n, a) => {
      try {
        var i = _.lookupPath(n, { follow: !a });
        n = i.path;
      } catch {
      }
      var s = { isRoot: !1, exists: !1, error: 0, name: null, path: null, object: null, parentExists: !1, parentPath: null, parentObject: null };
      try {
        var i = _.lookupPath(n, { parent: !0 });
        s.parentExists = !0, s.parentPath = i.path, s.parentObject = i.node, s.name = Y.basename(n), i = _.lookupPath(n, { follow: !a }), s.exists = !0, s.path = i.path, s.object = i.node, s.name = i.node.name, s.isRoot = i.path === "/";
      } catch (u) {
        s.error = u.errno;
      }
      return s;
    }, createPath: (n, a, i, s) => {
      n = typeof n == "string" ? n : _.getPath(n);
      for (var u = a.split("/").reverse(); u.length; ) {
        var c = u.pop();
        if (c) {
          var m = Y.join2(n, c);
          try {
            _.mkdir(m);
          } catch {
          }
          n = m;
        }
      }
      return m;
    }, createFile: (n, a, i, s, u) => {
      var c = Y.join2(typeof n == "string" ? n : _.getPath(n), a), m = $t(s, u);
      return _.create(c, m);
    }, createDataFile: (n, a, i, s, u, c) => {
      var m = a;
      n && (n = typeof n == "string" ? n : _.getPath(n), m = a ? Y.join2(n, a) : n);
      var f = $t(s, u), d = _.create(m, f);
      if (i) {
        if (typeof i == "string") {
          for (var y = new Array(i.length), k = 0, D = i.length; k < D; ++k) y[k] = i.charCodeAt(k);
          i = y;
        }
        _.chmod(d, f | 146);
        var M = _.open(d, 577);
        _.write(M, i, 0, i.length, 0, c), _.close(M), _.chmod(d, f);
      }
      return d;
    }, createDevice: (n, a, i, s) => {
      var u = Y.join2(typeof n == "string" ? n : _.getPath(n), a), c = $t(!!i, !!s);
      _.createDevice.major || (_.createDevice.major = 64);
      var m = _.makedev(_.createDevice.major++, 0);
      return _.registerDevice(m, { open: (f) => {
        f.seekable = !1;
      }, close: (f) => {
        s && s.buffer && s.buffer.length && s(10);
      }, read: (f, d, y, k, D) => {
        for (var M = 0, I = 0; I < k; I++) {
          var R;
          try {
            R = i();
          } catch {
            throw new _.ErrnoError(29);
          }
          if (R === void 0 && M === 0)
            throw new _.ErrnoError(6);
          if (R == null) break;
          M++, d[y + I] = R;
        }
        return M && (f.node.timestamp = Date.now()), M;
      }, write: (f, d, y, k, D) => {
        for (var M = 0; M < k; M++)
          try {
            s(d[y + M]);
          } catch {
            throw new _.ErrnoError(29);
          }
        return k && (f.node.timestamp = Date.now()), M;
      } }), _.mkdev(u, c, m);
    }, forceLoadFile: (n) => {
      if (n.isDevice || n.isFolder || n.link || n.contents) return !0;
      if (typeof XMLHttpRequest < "u")
        throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
      if (pe)
        try {
          n.contents = kt(pe(n.url), !0), n.usedBytes = n.contents.length;
        } catch {
          throw new _.ErrnoError(29);
        }
      else
        throw new Error("Cannot load without read() or XMLHttpRequest.");
    }, createLazyFile: (n, a, i, s, u) => {
      function c() {
        this.lengthKnown = !1, this.chunks = [];
      }
      if (c.prototype.get = function(I) {
        if (!(I > this.length - 1 || I < 0)) {
          var R = I % this.chunkSize, $ = I / this.chunkSize | 0;
          return this.getter($)[R];
        }
      }, c.prototype.setDataGetter = function(I) {
        this.getter = I;
      }, c.prototype.cacheLength = function() {
        var I = new XMLHttpRequest();
        if (I.open("HEAD", i, !1), I.send(null), !(I.status >= 200 && I.status < 300 || I.status === 304)) throw new Error("Couldn't load " + i + ". Status: " + I.status);
        var R = Number(I.getResponseHeader("Content-length")), $, q = ($ = I.getResponseHeader("Accept-Ranges")) && $ === "bytes", j = ($ = I.getResponseHeader("Content-Encoding")) && $ === "gzip", v = 1024 * 1024;
        q || (v = R);
        var P = (X, oe) => {
          if (X > oe) throw new Error("invalid range (" + X + ", " + oe + ") or no bytes requested!");
          if (oe > R - 1) throw new Error("only " + R + " bytes available! programmer error!");
          var J = new XMLHttpRequest();
          if (J.open("GET", i, !1), R !== v && J.setRequestHeader("Range", "bytes=" + X + "-" + oe), J.responseType = "arraybuffer", J.overrideMimeType && J.overrideMimeType("text/plain; charset=x-user-defined"), J.send(null), !(J.status >= 200 && J.status < 300 || J.status === 304)) throw new Error("Couldn't load " + i + ". Status: " + J.status);
          return J.response !== void 0 ? new Uint8Array(J.response || []) : kt(J.responseText || "", !0);
        }, O = this;
        O.setDataGetter((X) => {
          var oe = X * v, J = (X + 1) * v - 1;
          if (J = Math.min(J, R - 1), typeof O.chunks[X] > "u" && (O.chunks[X] = P(oe, J)), typeof O.chunks[X] > "u") throw new Error("doXHR failed!");
          return O.chunks[X];
        }), (j || !R) && (v = R = 1, R = this.getter(0).length, v = R, Je("LazyFiles on gzip forces download of the whole file when length is accessed")), this._length = R, this._chunkSize = v, this.lengthKnown = !0;
      }, typeof XMLHttpRequest < "u") {
        if (!C) throw "Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";
        var m = new c();
        Object.defineProperties(m, { length: { get: function() {
          return this.lengthKnown || this.cacheLength(), this._length;
        } }, chunkSize: { get: function() {
          return this.lengthKnown || this.cacheLength(), this._chunkSize;
        } } });
        var f = { isDevice: !1, contents: m };
      } else
        var f = { isDevice: !1, url: i };
      var d = _.createFile(n, a, f, s, u);
      f.contents ? d.contents = f.contents : f.url && (d.contents = null, d.url = f.url), Object.defineProperties(d, { usedBytes: { get: function() {
        return this.contents.length;
      } } });
      var y = {}, k = Object.keys(d.stream_ops);
      k.forEach((M) => {
        var I = d.stream_ops[M];
        y[M] = function() {
          return _.forceLoadFile(d), I.apply(null, arguments);
        };
      });
      function D(M, I, R, $, q) {
        var j = M.node.contents;
        if (q >= j.length) return 0;
        var v = Math.min(j.length - q, $);
        if (j.slice)
          for (var P = 0; P < v; P++)
            I[R + P] = j[q + P];
        else
          for (var P = 0; P < v; P++)
            I[R + P] = j.get(q + P);
        return v;
      }
      return y.read = (M, I, R, $, q) => (_.forceLoadFile(d), D(M, I, R, $, q)), y.mmap = (M, I, R, $, q) => {
        _.forceLoadFile(d);
        var j = Mn(I);
        if (!j)
          throw new _.ErrnoError(48);
        return D(M, V, j, I, R), { ptr: j, allocated: !0 };
      }, d.stream_ops = y, d;
    } }, tt = (n, a) => (n >>>= 0, n ? je(te, n, a) : ""), E = { DEFAULT_POLLMASK: 5, calculateAt: function(n, a, i) {
      if (Y.isAbs(a))
        return a;
      var s;
      if (n === -100)
        s = _.cwd();
      else {
        var u = E.getStreamFromFD(n);
        s = u.path;
      }
      if (a.length == 0) {
        if (!i)
          throw new _.ErrnoError(44);
        return s;
      }
      return Y.join2(s, a);
    }, doStat: function(n, a, i) {
      try {
        var s = n(a);
      } catch (f) {
        if (f && f.node && Y.normalize(a) !== Y.normalize(_.getPath(f.node)))
          return -54;
        throw f;
      }
      b[i >>> 2] = s.dev, b[i + 4 >>> 2] = s.mode, W[i + 8 >>> 2] = s.nlink, b[i + 12 >>> 2] = s.uid, b[i + 16 >>> 2] = s.gid, b[i + 20 >>> 2] = s.rdev, ue[i + 24 >> 3] = BigInt(s.size), b[i + 32 >>> 2] = 4096, b[i + 36 >>> 2] = s.blocks;
      var u = s.atime.getTime(), c = s.mtime.getTime(), m = s.ctime.getTime();
      return ue[i + 40 >> 3] = BigInt(Math.floor(u / 1e3)), W[i + 48 >>> 2] = u % 1e3 * 1e3, ue[i + 56 >> 3] = BigInt(Math.floor(c / 1e3)), W[i + 64 >>> 2] = c % 1e3 * 1e3, ue[i + 72 >> 3] = BigInt(Math.floor(m / 1e3)), W[i + 80 >>> 2] = m % 1e3 * 1e3, ue[i + 88 >> 3] = BigInt(s.ino), 0;
    }, doMsync: function(n, a, i, s, u) {
      if (!_.isFile(a.node.mode))
        throw new _.ErrnoError(43);
      if (s & 2)
        return 0;
      n >>>= 0;
      var c = te.slice(n, n + i);
      _.msync(a, c, u, i, s);
    }, varargs: void 0, get: function() {
      E.varargs += 4;
      var n = b[E.varargs - 4 >>> 2];
      return n;
    }, getStr: function(n) {
      var a = tt(n);
      return a;
    }, getStreamFromFD: function(n) {
      var a = _.getStreamChecked(n);
      return a;
    } };
    function ra(n, a) {
      try {
        return n = E.getStr(n), _.chmod(n, a), 0;
      } catch (i) {
        if (typeof _ > "u" || i.name !== "ErrnoError") throw i;
        return -i.errno;
      }
    }
    function aa(n, a, i, s) {
      try {
        if (a = E.getStr(a), a = E.calculateAt(n, a), i & -8)
          return -28;
        var u = _.lookupPath(a, { follow: !0 }), c = u.node;
        if (!c)
          return -44;
        var m = "";
        return i & 4 && (m += "r"), i & 2 && (m += "w"), i & 1 && (m += "x"), m && _.nodePermissions(c, m) ? -2 : 0;
      } catch (f) {
        if (typeof _ > "u" || f.name !== "ErrnoError") throw f;
        return -f.errno;
      }
    }
    var ia = 9007199254740992, sa = -9007199254740992;
    function xe(n) {
      return n < sa || n > ia ? NaN : Number(n);
    }
    function ua(n, a, i, s) {
      try {
        if (i = xe(i), isNaN(i) || (s = xe(s), isNaN(s))) return -61;
        var u = E.getStreamFromFD(n);
        return _.allocate(u, i, s), 0;
      } catch (c) {
        if (typeof _ > "u" || c.name !== "ErrnoError") throw c;
        return -c.errno;
      }
    }
    function oa(n, a) {
      try {
        return _.fchmod(n, a), 0;
      } catch (i) {
        if (typeof _ > "u" || i.name !== "ErrnoError") throw i;
        return -i.errno;
      }
    }
    var In = (n) => (b[rr() >>> 2] = n, n);
    function _a(n, a, i) {
      E.varargs = i;
      try {
        var s = E.getStreamFromFD(n);
        switch (a) {
          case 0: {
            var u = E.get();
            if (u < 0)
              return -28;
            var c;
            return c = _.createStream(s, u), c.fd;
          }
          case 1:
          case 2:
            return 0;
          case 3:
            return s.flags;
          case 4: {
            var u = E.get();
            return s.flags |= u, 0;
          }
          case 5: {
            var u = E.get(), m = 0;
            return se[u + m >>> 1] = 2, 0;
          }
          case 6:
          case 7:
            return 0;
          case 16:
          case 8:
            return -28;
          case 9:
            return In(28), -1;
          default:
            return -28;
        }
      } catch (f) {
        if (typeof _ > "u" || f.name !== "ErrnoError") throw f;
        return -f.errno;
      }
    }
    function la(n, a) {
      try {
        var i = E.getStreamFromFD(n);
        return E.doStat(_.stat, i.path, a);
      } catch (s) {
        if (typeof _ > "u" || s.name !== "ErrnoError") throw s;
        return -s.errno;
      }
    }
    var Xe = (n, a, i) => Ft(n, te, a, i);
    function ca(n, a) {
      try {
        if (a === 0) return -28;
        var i = _.cwd(), s = Be(i) + 1;
        return a < s ? -68 : (Xe(i, n, a), s);
      } catch (u) {
        if (typeof _ > "u" || u.name !== "ErrnoError") throw u;
        return -u.errno;
      }
    }
    function ga(n, a, i) {
      try {
        var s = E.getStreamFromFD(n);
        s.getdents || (s.getdents = _.readdir(s.path));
        for (var u = 280, c = 0, m = _.llseek(s, 0, 1), f = Math.floor(m / u); f < s.getdents.length && c + u <= i; ) {
          var d, y, k = s.getdents[f];
          if (k === ".")
            d = s.node.id, y = 4;
          else if (k === "..") {
            var D = _.lookupPath(s.path, { parent: !0 });
            d = D.node.id, y = 4;
          } else {
            var M = _.lookupNode(s.node, k);
            d = M.id, y = _.isChrdev(M.mode) ? 2 : _.isDir(M.mode) ? 4 : _.isLink(M.mode) ? 10 : 8;
          }
          ue[a + c >> 3] = BigInt(d), ue[a + c + 8 >> 3] = BigInt((f + 1) * u), se[a + c + 16 >>> 1] = 280, V[a + c + 18 >>> 0] = y, Xe(k, a + c + 19, 256), c += u, f += 1;
        }
        return _.llseek(s, f * u, 0), c;
      } catch (I) {
        if (typeof _ > "u" || I.name !== "ErrnoError") throw I;
        return -I.errno;
      }
    }
    function ma(n, a, i) {
      E.varargs = i;
      try {
        var s = E.getStreamFromFD(n);
        switch (a) {
          case 21509:
            return s.tty ? 0 : -59;
          case 21505: {
            if (!s.tty) return -59;
            if (s.tty.ops.ioctl_tcgets) {
              var u = s.tty.ops.ioctl_tcgets(s), c = E.get();
              b[c >>> 2] = u.c_iflag || 0, b[c + 4 >>> 2] = u.c_oflag || 0, b[c + 8 >>> 2] = u.c_cflag || 0, b[c + 12 >>> 2] = u.c_lflag || 0;
              for (var m = 0; m < 32; m++)
                V[c + m + 17 >>> 0] = u.c_cc[m] || 0;
              return 0;
            }
            return 0;
          }
          case 21510:
          case 21511:
          case 21512:
            return s.tty ? 0 : -59;
          case 21506:
          case 21507:
          case 21508: {
            if (!s.tty) return -59;
            if (s.tty.ops.ioctl_tcsets) {
              for (var c = E.get(), f = b[c >>> 2], d = b[c + 4 >>> 2], y = b[c + 8 >>> 2], k = b[c + 12 >>> 2], D = [], m = 0; m < 32; m++)
                D.push(V[c + m + 17 >>> 0]);
              return s.tty.ops.ioctl_tcsets(s.tty, a, { c_iflag: f, c_oflag: d, c_cflag: y, c_lflag: k, c_cc: D });
            }
            return 0;
          }
          case 21519: {
            if (!s.tty) return -59;
            var c = E.get();
            return b[c >>> 2] = 0, 0;
          }
          case 21520:
            return s.tty ? -28 : -59;
          case 21531: {
            var c = E.get();
            return _.ioctl(s, a, c);
          }
          case 21523: {
            if (!s.tty) return -59;
            if (s.tty.ops.ioctl_tiocgwinsz) {
              var M = s.tty.ops.ioctl_tiocgwinsz(s.tty), c = E.get();
              se[c >>> 1] = M[0], se[c + 2 >>> 1] = M[1];
            }
            return 0;
          }
          case 21524:
            return s.tty ? 0 : -59;
          case 21515:
            return s.tty ? 0 : -59;
          default:
            return -28;
        }
      } catch (I) {
        if (typeof _ > "u" || I.name !== "ErrnoError") throw I;
        return -I.errno;
      }
    }
    function fa(n, a) {
      try {
        return n = E.getStr(n), E.doStat(_.lstat, n, a);
      } catch (i) {
        if (typeof _ > "u" || i.name !== "ErrnoError") throw i;
        return -i.errno;
      }
    }
    function pa(n, a, i, s) {
      try {
        a = E.getStr(a);
        var u = s & 256, c = s & 4096;
        return s = s & -6401, a = E.calculateAt(n, a, c), E.doStat(u ? _.lstat : _.stat, a, i);
      } catch (m) {
        if (typeof _ > "u" || m.name !== "ErrnoError") throw m;
        return -m.errno;
      }
    }
    function da(n, a, i, s) {
      E.varargs = s;
      try {
        a = E.getStr(a), a = E.calculateAt(n, a);
        var u = s ? E.get() : 0;
        return _.open(a, i, u).fd;
      } catch (c) {
        if (typeof _ > "u" || c.name !== "ErrnoError") throw c;
        return -c.errno;
      }
    }
    function ha(n, a, i, s) {
      try {
        if (a = E.getStr(a), a = E.calculateAt(n, a), s <= 0) return -28;
        var u = _.readlink(a), c = Math.min(s, Be(u)), m = V[i + c >>> 0];
        return Xe(u, i, s + 1), V[i + c >>> 0] = m, c;
      } catch (f) {
        if (typeof _ > "u" || f.name !== "ErrnoError") throw f;
        return -f.errno;
      }
    }
    function ya(n, a, i, s) {
      try {
        return a = E.getStr(a), s = E.getStr(s), a = E.calculateAt(n, a), s = E.calculateAt(i, s), _.rename(a, s), 0;
      } catch (u) {
        if (typeof _ > "u" || u.name !== "ErrnoError") throw u;
        return -u.errno;
      }
    }
    function wa(n) {
      try {
        return n = E.getStr(n), _.rmdir(n), 0;
      } catch (a) {
        if (typeof _ > "u" || a.name !== "ErrnoError") throw a;
        return -a.errno;
      }
    }
    function Sa(n, a) {
      try {
        return n = E.getStr(n), E.doStat(_.stat, n, a);
      } catch (i) {
        if (typeof _ > "u" || i.name !== "ErrnoError") throw i;
        return -i.errno;
      }
    }
    function ka(n, a) {
      try {
        return n = E.getStr(n), a = E.getStr(a), _.symlink(n, a), 0;
      } catch (i) {
        if (typeof _ > "u" || i.name !== "ErrnoError") throw i;
        return -i.errno;
      }
    }
    function va(n, a, i) {
      try {
        return a = E.getStr(a), a = E.calculateAt(n, a), i === 0 ? _.unlink(a) : i === 512 ? _.rmdir(a) : de("Invalid flags passed to unlinkat"), 0;
      } catch (s) {
        if (typeof _ > "u" || s.name !== "ErrnoError") throw s;
        return -s.errno;
      }
    }
    var vt = {};
    function Dn(n) {
      for (; n.length; ) {
        var a = n.pop(), i = n.pop();
        i(a);
      }
    }
    function nt(n) {
      return this.fromWireType(b[n >>> 2]);
    }
    var Ve = {}, ze = {}, Mt = {}, Ma = 48, Ia = 57;
    function It(n) {
      if (n === void 0)
        return "_unknown";
      n = n.replace(/[^a-zA-Z0-9_]/g, "$");
      var a = n.charCodeAt(0);
      return a >= Ma && a <= Ia ? `_${n}` : n;
    }
    function Dt(n, a) {
      return n = It(n), { [n]: function() {
        return a.apply(this, arguments);
      } }[n];
    }
    function Yt(n, a) {
      var i = Dt(a, function(s) {
        this.name = a, this.message = s;
        var u = new Error(s).stack;
        u !== void 0 && (this.stack = this.toString() + `
` + u.replace(/^Error(:[^\n]*)?\n/, ""));
      });
      return i.prototype = Object.create(n.prototype), i.prototype.constructor = i, i.prototype.toString = function() {
        return this.message === void 0 ? this.name : `${this.name}: ${this.message}`;
      }, i;
    }
    var Gn = void 0;
    function Gt(n) {
      throw new Gn(n);
    }
    function jt(n, a, i) {
      n.forEach(function(f) {
        Mt[f] = a;
      });
      function s(f) {
        var d = i(f);
        d.length !== n.length && Gt("Mismatched type converter count");
        for (var y = 0; y < n.length; ++y)
          me(n[y], d[y]);
      }
      var u = new Array(a.length), c = [], m = 0;
      a.forEach((f, d) => {
        ze.hasOwnProperty(f) ? u[d] = ze[f] : (c.push(f), Ve.hasOwnProperty(f) || (Ve[f] = []), Ve[f].push(() => {
          u[d] = ze[f], ++m, m === c.length && s(u);
        }));
      }), c.length === 0 && s(u);
    }
    var Da = function(n) {
      var a = vt[n];
      delete vt[n];
      var i = a.rawConstructor, s = a.rawDestructor, u = a.fields, c = u.map((m) => m.getterReturnType).concat(u.map((m) => m.setterArgumentType));
      jt([n], c, (m) => {
        var f = {};
        return u.forEach((d, y) => {
          var k = d.fieldName, D = m[y], M = d.getter, I = d.getterContext, R = m[y + u.length], $ = d.setter, q = d.setterContext;
          f[k] = { read: (j) => D.fromWireType(M(I, j)), write: (j, v) => {
            var P = [];
            $(q, j, R.toWireType(P, v)), Dn(P);
          } };
        }), [{ name: a.name, fromWireType: function(d) {
          var y = {};
          for (var k in f)
            y[k] = f[k].read(d);
          return s(d), y;
        }, toWireType: function(d, y) {
          for (var k in f)
            if (!(k in y))
              throw new TypeError(`Missing field: "${k}"`);
          var D = i();
          for (k in f)
            f[k].write(D, y[k]);
          return d !== null && d.push(s, D), D;
        }, argPackAdvance: 8, readValueFromPointer: nt, destructorFunction: s }];
      });
    };
    function rt(n) {
      if (n === null)
        return "null";
      var a = typeof n;
      return a === "object" || a === "array" || a === "function" ? n.toString() : "" + n;
    }
    function Ga() {
      for (var n = new Array(256), a = 0; a < 256; ++a)
        n[a] = String.fromCharCode(a);
      bn = n;
    }
    var bn = void 0;
    function ee(n) {
      for (var a = "", i = n; te[i >>> 0]; )
        a += bn[te[i++ >>> 0]];
      return a;
    }
    var at = void 0;
    function N(n) {
      throw new at(n);
    }
    function me(n, a, i = {}) {
      if (!("argPackAdvance" in a))
        throw new TypeError("registerType registeredInstance requires argPackAdvance");
      var s = a.name;
      if (n || N(`type "${s}" must have a positive integer typeid pointer`), ze.hasOwnProperty(n)) {
        if (i.ignoreDuplicateRegistrations)
          return;
        N(`Cannot register type '${s}' twice`);
      }
      if (ze[n] = a, delete Mt[n], Ve.hasOwnProperty(n)) {
        var u = Ve[n];
        delete Ve[n], u.forEach((c) => c());
      }
    }
    function Pn(n, a, i) {
      switch (a) {
        case 0:
          return i ? function(u) {
            return V[u >>> 0];
          } : function(u) {
            return te[u >>> 0];
          };
        case 1:
          return i ? function(u) {
            return se[u >>> 1];
          } : function(u) {
            return Ze[u >>> 1];
          };
        case 2:
          return i ? function(u) {
            return b[u >>> 2];
          } : function(u) {
            return W[u >>> 2];
          };
        case 3:
          return i ? function(u) {
            return ue[u >> 3];
          } : function(u) {
            return gn[u >> 3];
          };
        default:
          throw new TypeError("Unknown integer type: " + n);
      }
    }
    function ba(n, a, i, s, u) {
      a = ee(a);
      var c = it(i), m = a.indexOf("u") != -1;
      m && (u = (1n << 64n) - 1n), me(n, { name: a, fromWireType: function(f) {
        return f;
      }, toWireType: function(f, d) {
        if (typeof d != "bigint" && typeof d != "number")
          throw new TypeError(`Cannot convert "${rt(d)}" to ${this.name}`);
        if (d < s || d > u)
          throw new TypeError(`Passing a number "${rt(d)}" from JS side to C/C++ side to an argument of type "${a}", which is outside the valid range [${s}, ${u}]!`);
        return d;
      }, argPackAdvance: 8, readValueFromPointer: Pn(a, c, !m), destructorFunction: null });
    }
    function it(n) {
      switch (n) {
        case 1:
          return 0;
        case 2:
          return 1;
        case 4:
          return 2;
        case 8:
          return 3;
        default:
          throw new TypeError(`Unknown type size: ${n}`);
      }
    }
    function Pa(n, a, i, s, u) {
      var c = it(i);
      a = ee(a), me(n, { name: a, fromWireType: function(m) {
        return !!m;
      }, toWireType: function(m, f) {
        return f ? s : u;
      }, argPackAdvance: 8, readValueFromPointer: function(m) {
        var f;
        if (i === 1)
          f = V;
        else if (i === 2)
          f = se;
        else if (i === 4)
          f = b;
        else
          throw new TypeError("Unknown boolean type size: " + a);
        return this.fromWireType(f[m >>> c]);
      }, destructorFunction: null });
    }
    function Aa(n) {
      if (!(this instanceof Ee) || !(n instanceof Ee))
        return !1;
      for (var a = this.$$.ptrType.registeredClass, i = this.$$.ptr, s = n.$$.ptrType.registeredClass, u = n.$$.ptr; a.baseClass; )
        i = a.upcast(i), a = a.baseClass;
      for (; s.baseClass; )
        u = s.upcast(u), s = s.baseClass;
      return a === s && i === u;
    }
    function Ea(n) {
      return { count: n.count, deleteScheduled: n.deleteScheduled, preservePointerOnDelete: n.preservePointerOnDelete, ptr: n.ptr, ptrType: n.ptrType, smartPtr: n.smartPtr, smartPtrType: n.smartPtrType };
    }
    function Xt(n) {
      function a(i) {
        return i.$$.ptrType.registeredClass.name;
      }
      N(a(n) + " instance already deleted");
    }
    var Vt = !1;
    function An(n) {
    }
    function Ta(n) {
      n.smartPtr ? n.smartPtrType.rawDestructor(n.smartPtr) : n.ptrType.registeredClass.rawDestructor(n.ptr);
    }
    function En(n) {
      n.count.value -= 1;
      var a = n.count.value === 0;
      a && Ta(n);
    }
    function Tn(n, a, i) {
      if (a === i)
        return n;
      if (i.baseClass === void 0)
        return null;
      var s = Tn(n, a, i.baseClass);
      return s === null ? null : i.downcast(s);
    }
    var Rn = {};
    function Ra() {
      return Object.keys(ot).length;
    }
    function Ca() {
      var n = [];
      for (var a in ot)
        ot.hasOwnProperty(a) && n.push(ot[a]);
      return n;
    }
    var st = [];
    function qt() {
      for (; st.length; ) {
        var n = st.pop();
        n.$$.deleteScheduled = !1, n.delete();
      }
    }
    var ut = void 0;
    function Wa(n) {
      ut = n, st.length && ut && ut(qt);
    }
    function Ba() {
      e.getInheritedInstanceCount = Ra, e.getLiveInheritedInstances = Ca, e.flushPendingDeletes = qt, e.setDelayFunction = Wa;
    }
    var ot = {};
    function La(n, a) {
      for (a === void 0 && N("ptr should not be undefined"); n.baseClass; )
        a = n.upcast(a), n = n.baseClass;
      return a;
    }
    function xa(n, a) {
      return a = La(n, a), ot[a];
    }
    function bt(n, a) {
      (!a.ptrType || !a.ptr) && Gt("makeClassHandle requires ptr and ptrType");
      var i = !!a.smartPtrType, s = !!a.smartPtr;
      return i !== s && Gt("Both smartPtrType and smartPtr must be specified"), a.count = { value: 1 }, _t(Object.create(n, { $$: { value: a } }));
    }
    function za(n) {
      var a = this.getPointee(n);
      if (!a)
        return this.destructor(n), null;
      var i = xa(this.registeredClass, a);
      if (i !== void 0) {
        if (i.$$.count.value === 0)
          return i.$$.ptr = a, i.$$.smartPtr = n, i.clone();
        var s = i.clone();
        return this.destructor(n), s;
      }
      function u() {
        return this.isSmartPointer ? bt(this.registeredClass.instancePrototype, { ptrType: this.pointeeType, ptr: a, smartPtrType: this, smartPtr: n }) : bt(this.registeredClass.instancePrototype, { ptrType: this, ptr: n });
      }
      var c = this.registeredClass.getActualType(a), m = Rn[c];
      if (!m)
        return u.call(this);
      var f;
      this.isConst ? f = m.constPointerType : f = m.pointerType;
      var d = Tn(a, this.registeredClass, f.registeredClass);
      return d === null ? u.call(this) : this.isSmartPointer ? bt(f.registeredClass.instancePrototype, { ptrType: f, ptr: d, smartPtrType: this, smartPtr: n }) : bt(f.registeredClass.instancePrototype, { ptrType: f, ptr: d });
    }
    var _t = function(n) {
      return typeof FinalizationRegistry > "u" ? (_t = (a) => a, n) : (Vt = new FinalizationRegistry((a) => {
        En(a.$$);
      }), _t = (a) => {
        var i = a.$$, s = !!i.smartPtr;
        if (s) {
          var u = { $$: i };
          Vt.register(a, u, a);
        }
        return a;
      }, An = (a) => Vt.unregister(a), _t(n));
    };
    function Na() {
      if (this.$$.ptr || Xt(this), this.$$.preservePointerOnDelete)
        return this.$$.count.value += 1, this;
      var n = _t(Object.create(Object.getPrototypeOf(this), { $$: { value: Ea(this.$$) } }));
      return n.$$.count.value += 1, n.$$.deleteScheduled = !1, n;
    }
    function Ha() {
      this.$$.ptr || Xt(this), this.$$.deleteScheduled && !this.$$.preservePointerOnDelete && N("Object already scheduled for deletion"), An(this), En(this.$$), this.$$.preservePointerOnDelete || (this.$$.smartPtr = void 0, this.$$.ptr = void 0);
    }
    function Ua() {
      return !this.$$.ptr;
    }
    function Fa() {
      return this.$$.ptr || Xt(this), this.$$.deleteScheduled && !this.$$.preservePointerOnDelete && N("Object already scheduled for deletion"), st.push(this), st.length === 1 && ut && ut(qt), this.$$.deleteScheduled = !0, this;
    }
    function $a() {
      Ee.prototype.isAliasOf = Aa, Ee.prototype.clone = Na, Ee.prototype.delete = Ha, Ee.prototype.isDeleted = Ua, Ee.prototype.deleteLater = Fa;
    }
    function Ee() {
    }
    function Ya(n, a, i) {
      if (n[a].overloadTable === void 0) {
        var s = n[a];
        n[a] = function() {
          return n[a].overloadTable.hasOwnProperty(arguments.length) || N(`Function '${i}' called with an invalid number of arguments (${arguments.length}) - expects one of (${n[a].overloadTable})!`), n[a].overloadTable[arguments.length].apply(this, arguments);
        }, n[a].overloadTable = [], n[a].overloadTable[s.argCount] = s;
      }
    }
    function Qt(n, a, i) {
      e.hasOwnProperty(n) ? ((i === void 0 || e[n].overloadTable !== void 0 && e[n].overloadTable[i] !== void 0) && N(`Cannot register public name '${n}' twice`), Ya(e, n, n), e.hasOwnProperty(i) && N(`Cannot register multiple overloads of a function with the same number of arguments (${i})!`), e[n].overloadTable[i] = a) : (e[n] = a, i !== void 0 && (e[n].numArguments = i));
    }
    function ja(n, a, i, s, u, c, m, f) {
      this.name = n, this.constructor = a, this.instancePrototype = i, this.rawDestructor = s, this.baseClass = u, this.getActualType = c, this.upcast = m, this.downcast = f, this.pureVirtualFunctions = [];
    }
    function Jt(n, a, i) {
      for (; a !== i; )
        a.upcast || N(`Expected null or instance of ${i.name}, got an instance of ${a.name}`), n = a.upcast(n), a = a.baseClass;
      return n;
    }
    function Xa(n, a) {
      if (a === null)
        return this.isReference && N(`null is not a valid ${this.name}`), 0;
      a.$$ || N(`Cannot pass "${rt(a)}" as a ${this.name}`), a.$$.ptr || N(`Cannot pass deleted object as a pointer of type ${this.name}`);
      var i = a.$$.ptrType.registeredClass, s = Jt(a.$$.ptr, i, this.registeredClass);
      return s;
    }
    function Va(n, a) {
      var i;
      if (a === null)
        return this.isReference && N(`null is not a valid ${this.name}`), this.isSmartPointer ? (i = this.rawConstructor(), n !== null && n.push(this.rawDestructor, i), i) : 0;
      a.$$ || N(`Cannot pass "${rt(a)}" as a ${this.name}`), a.$$.ptr || N(`Cannot pass deleted object as a pointer of type ${this.name}`), !this.isConst && a.$$.ptrType.isConst && N(`Cannot convert argument of type ${a.$$.smartPtrType ? a.$$.smartPtrType.name : a.$$.ptrType.name} to parameter type ${this.name}`);
      var s = a.$$.ptrType.registeredClass;
      if (i = Jt(a.$$.ptr, s, this.registeredClass), this.isSmartPointer)
        switch (a.$$.smartPtr === void 0 && N("Passing raw pointer to smart pointer is illegal"), this.sharingPolicy) {
          case 0:
            a.$$.smartPtrType === this ? i = a.$$.smartPtr : N(`Cannot convert argument of type ${a.$$.smartPtrType ? a.$$.smartPtrType.name : a.$$.ptrType.name} to parameter type ${this.name}`);
            break;
          case 1:
            i = a.$$.smartPtr;
            break;
          case 2:
            if (a.$$.smartPtrType === this)
              i = a.$$.smartPtr;
            else {
              var u = a.clone();
              i = this.rawShare(i, fe.toHandle(function() {
                u.delete();
              })), n !== null && n.push(this.rawDestructor, i);
            }
            break;
          default:
            N("Unsupporting sharing policy");
        }
      return i;
    }
    function qa(n, a) {
      if (a === null)
        return this.isReference && N(`null is not a valid ${this.name}`), 0;
      a.$$ || N(`Cannot pass "${rt(a)}" as a ${this.name}`), a.$$.ptr || N(`Cannot pass deleted object as a pointer of type ${this.name}`), a.$$.ptrType.isConst && N(`Cannot convert argument of type ${a.$$.ptrType.name} to parameter type ${this.name}`);
      var i = a.$$.ptrType.registeredClass, s = Jt(a.$$.ptr, i, this.registeredClass);
      return s;
    }
    function Qa(n) {
      return this.rawGetPointee && (n = this.rawGetPointee(n)), n;
    }
    function Ja(n) {
      this.rawDestructor && this.rawDestructor(n);
    }
    function Ka(n) {
      n !== null && n.delete();
    }
    function Za() {
      ye.prototype.getPointee = Qa, ye.prototype.destructor = Ja, ye.prototype.argPackAdvance = 8, ye.prototype.readValueFromPointer = nt, ye.prototype.deleteObject = Ka, ye.prototype.fromWireType = za;
    }
    function ye(n, a, i, s, u, c, m, f, d, y, k) {
      this.name = n, this.registeredClass = a, this.isReference = i, this.isConst = s, this.isSmartPointer = u, this.pointeeType = c, this.sharingPolicy = m, this.rawGetPointee = f, this.rawConstructor = d, this.rawShare = y, this.rawDestructor = k, !u && a.baseClass === void 0 ? s ? (this.toWireType = Xa, this.destructorFunction = null) : (this.toWireType = qa, this.destructorFunction = null) : this.toWireType = Va;
    }
    function Cn(n, a, i) {
      e.hasOwnProperty(n) || Gt("Replacing nonexistant public symbol"), e[n].overloadTable !== void 0 && i !== void 0 ? e[n].overloadTable[i] = a : (e[n] = a, e[n].argCount = i);
    }
    function we(n, a) {
      n = ee(n);
      function i() {
        return z(a);
      }
      var s = i();
      return typeof s != "function" && N(`unknown function pointer with signature ${n}: ${a}`), s;
    }
    var Wn = void 0;
    function Bn(n) {
      var a = ar(n), i = ee(a);
      return Se(a), i;
    }
    function Ln(n, a) {
      var i = [], s = {};
      function u(c) {
        if (!s[c] && !ze[c]) {
          if (Mt[c]) {
            Mt[c].forEach(u);
            return;
          }
          i.push(c), s[c] = !0;
        }
      }
      throw a.forEach(u), new Wn(`${n}: ` + i.map(Bn).join([", "]));
    }
    function Oa(n, a, i, s, u, c, m, f, d, y, k, D, M) {
      k = ee(k), c = we(u, c), f && (f = we(m, f)), y && (y = we(d, y)), M = we(D, M);
      var I = It(k);
      Qt(I, function() {
        Ln(`Cannot construct ${k} due to unbound types`, [s]);
      }), jt([n, a, i], s ? [s] : [], function(R) {
        R = R[0];
        var $, q;
        s ? ($ = R.registeredClass, q = $.instancePrototype) : q = Ee.prototype;
        var j = Dt(I, function() {
          if (Object.getPrototypeOf(this) !== v)
            throw new at("Use 'new' to construct " + k);
          if (P.constructor_body === void 0)
            throw new at(k + " has no accessible constructor");
          var J = P.constructor_body[arguments.length];
          if (J === void 0)
            throw new at(`Tried to invoke ctor of ${k} with invalid number of parameters (${arguments.length}) - expected (${Object.keys(P.constructor_body).toString()}) parameters instead!`);
          return J.apply(this, arguments);
        }), v = Object.create(q, { constructor: { value: j } });
        j.prototype = v;
        var P = new ja(k, j, v, M, $, c, f, y);
        P.baseClass && (P.baseClass.__derivedClasses === void 0 && (P.baseClass.__derivedClasses = []), P.baseClass.__derivedClasses.push(P));
        var O = new ye(k, P, !0, !1, !1), X = new ye(k + "*", P, !1, !1, !1), oe = new ye(k + " const*", P, !1, !0, !1);
        return Rn[n] = { pointerType: X, constPointerType: oe }, Cn(I, j), [O, X, oe];
      });
    }
    function ei() {
      this.allocated = [void 0], this.freelist = [], this.get = function(n) {
        return this.allocated[n];
      }, this.has = function(n) {
        return this.allocated[n] !== void 0;
      }, this.allocate = function(n) {
        var a = this.freelist.pop() || this.allocated.length;
        return this.allocated[a] = n, a;
      }, this.free = function(n) {
        this.allocated[n] = void 0, this.freelist.push(n);
      };
    }
    var le = new ei();
    function xn(n) {
      n >= le.reserved && --le.get(n).refcount === 0 && le.free(n);
    }
    function ti() {
      for (var n = 0, a = le.reserved; a < le.allocated.length; ++a)
        le.allocated[a] !== void 0 && ++n;
      return n;
    }
    function ni() {
      le.allocated.push({ value: void 0 }, { value: null }, { value: !0 }, { value: !1 }), le.reserved = le.allocated.length, e.count_emval_handles = ti;
    }
    var fe = { toValue: (n) => (n || N("Cannot use deleted val. handle = " + n), le.get(n).value), toHandle: (n) => {
      switch (n) {
        case void 0:
          return 1;
        case null:
          return 2;
        case !0:
          return 3;
        case !1:
          return 4;
        default:
          return le.allocate({ refcount: 1, value: n });
      }
    } };
    function ri(n, a) {
      a = ee(a), me(n, { name: a, fromWireType: function(i) {
        var s = fe.toValue(i);
        return xn(i), s;
      }, toWireType: function(i, s) {
        return fe.toHandle(s);
      }, argPackAdvance: 8, readValueFromPointer: nt, destructorFunction: null });
    }
    function ai(n, a, i) {
      switch (a) {
        case 0:
          return function(s) {
            var u = i ? V : te;
            return this.fromWireType(u[s >>> 0]);
          };
        case 1:
          return function(s) {
            var u = i ? se : Ze;
            return this.fromWireType(u[s >>> 1]);
          };
        case 2:
          return function(s) {
            var u = i ? b : W;
            return this.fromWireType(u[s >>> 2]);
          };
        default:
          throw new TypeError("Unknown integer type: " + n);
      }
    }
    function ii(n, a, i, s) {
      var u = it(i);
      a = ee(a);
      function c() {
      }
      c.values = {}, me(n, { name: a, constructor: c, fromWireType: function(m) {
        return this.constructor.values[m];
      }, toWireType: function(m, f) {
        return f.value;
      }, argPackAdvance: 8, readValueFromPointer: ai(a, u, s), destructorFunction: null }), Qt(a, c);
    }
    function Kt(n, a) {
      var i = ze[n];
      return i === void 0 && N(a + " has unknown type " + Bn(n)), i;
    }
    function si(n, a, i) {
      var s = Kt(n, "enum");
      a = ee(a);
      var u = s.constructor, c = Object.create(s.constructor.prototype, { value: { value: i }, constructor: { value: Dt(`${s.name}_${a}`, function() {
      }) } });
      u.values[i] = c, u[a] = c;
    }
    function ui(n, a) {
      switch (a) {
        case 2:
          return function(i) {
            return this.fromWireType(yt[i >>> 2]);
          };
        case 3:
          return function(i) {
            return this.fromWireType(wt[i >>> 3]);
          };
        default:
          throw new TypeError("Unknown float type: " + n);
      }
    }
    function oi(n, a, i) {
      var s = it(i);
      a = ee(a), me(n, { name: a, fromWireType: function(u) {
        return u;
      }, toWireType: function(u, c) {
        return c;
      }, argPackAdvance: 8, readValueFromPointer: ui(a, s), destructorFunction: null });
    }
    function zn(n, a) {
      if (!(n instanceof Function))
        throw new TypeError(`new_ called with constructor type ${typeof n} which is not a function`);
      var i = Dt(n.name || "unknownFunctionName", function() {
      });
      i.prototype = n.prototype;
      var s = new i(), u = n.apply(s, a);
      return u instanceof Object ? u : s;
    }
    function _i(n, a, i, s, u, c) {
      var m = a.length;
      m < 2 && N("argTypes array size mismatch! Must at least get return value and 'this' types!");
      for (var f = a[1] !== null && i !== null, d = !1, y = 1; y < a.length; ++y)
        if (a[y] !== null && a[y].destructorFunction === void 0) {
          d = !0;
          break;
        }
      for (var k = a[0].name !== "void", D = "", M = "", y = 0; y < m - 2; ++y)
        D += (y !== 0 ? ", " : "") + "arg" + y, M += (y !== 0 ? ", " : "") + "arg" + y + "Wired";
      var I = `
        return function ${It(n)}(${D}) {
        if (arguments.length !== ${m - 2}) {
          throwBindingError('function ${n} called with ${arguments.length} arguments, expected ${m - 2} args!');
        }`;
      d && (I += `var destructors = [];
`);
      var R = d ? "destructors" : "null", $ = ["throwBindingError", "invoker", "fn", "runDestructors", "retType", "classParam"], q = [N, s, u, Dn, a[0], a[1]];
      f && (I += "var thisWired = classParam.toWireType(" + R + `, this);
`);
      for (var y = 0; y < m - 2; ++y)
        I += "var arg" + y + "Wired = argType" + y + ".toWireType(" + R + ", arg" + y + "); // " + a[y + 2].name + `
`, $.push("argType" + y), q.push(a[y + 2]);
      if (f && (M = "thisWired" + (M.length > 0 ? ", " : "") + M), I += (k || c ? "var rv = " : "") + "invoker(fn" + (M.length > 0 ? ", " : "") + M + `);
`, d)
        I += `runDestructors(destructors);
`;
      else
        for (var y = f ? 1 : 2; y < a.length; ++y) {
          var j = y === 1 ? "thisWired" : "arg" + (y - 2) + "Wired";
          a[y].destructorFunction !== null && (I += j + "_dtor(" + j + "); // " + a[y].name + `
`, $.push(j + "_dtor"), q.push(a[y].destructorFunction));
        }
      return k && (I += `var ret = retType.fromWireType(rv);
return ret;
`), I += `}
`, $.push(I), zn(Function, $).apply(null, q);
    }
    function li(n, a) {
      for (var i = [], s = 0; s < n; s++)
        i.push(W[a + s * 4 >>> 2]);
      return i;
    }
    function ci(n, a, i, s, u, c, m) {
      var f = li(a, i);
      n = ee(n), u = we(s, u), Qt(n, function() {
        Ln(`Cannot call ${n} due to unbound types`, f);
      }, a - 1), jt([], f, function(d) {
        var y = [d[0], null].concat(d.slice(1));
        return Cn(n, _i(n, y, null, u, c, m), a - 1), [];
      });
    }
    function gi(n, a, i, s, u) {
      a = ee(a);
      var c = it(i), m = (D) => D;
      if (s === 0) {
        var f = 32 - 8 * i;
        m = (D) => D << f >>> f;
      }
      var d = a.includes("unsigned"), y = (D, M) => {
      }, k;
      d ? k = function(D, M) {
        return y(M, this.name), M >>> 0;
      } : k = function(D, M) {
        return y(M, this.name), M;
      }, me(n, { name: a, fromWireType: m, toWireType: k, argPackAdvance: 8, readValueFromPointer: Pn(a, c, s !== 0), destructorFunction: null });
    }
    function mi(n, a, i) {
      var s = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array, BigInt64Array, BigUint64Array], u = s[a];
      function c(m) {
        m = m >> 2;
        var f = W, d = f[m >>> 0], y = f[m + 1 >>> 0];
        return new u(f.buffer, y, d);
      }
      i = ee(i), me(n, { name: i, fromWireType: c, argPackAdvance: 8, readValueFromPointer: c }, { ignoreDuplicateRegistrations: !0 });
    }
    function fi(n, a) {
      a = ee(a);
      var i = a === "std::string";
      me(n, { name: a, fromWireType: function(s) {
        var u = W[s >>> 2], c = s + 4, m;
        if (i)
          for (var f = c, d = 0; d <= u; ++d) {
            var y = c + d;
            if (d == u || te[y >>> 0] == 0) {
              var k = y - f, D = tt(f, k);
              m === void 0 ? m = D : (m += "\0", m += D), f = y + 1;
            }
          }
        else {
          for (var M = new Array(u), d = 0; d < u; ++d)
            M[d] = String.fromCharCode(te[c + d >>> 0]);
          m = M.join("");
        }
        return Se(s), m;
      }, toWireType: function(s, u) {
        u instanceof ArrayBuffer && (u = new Uint8Array(u));
        var c, m = typeof u == "string";
        m || u instanceof Uint8Array || u instanceof Uint8ClampedArray || u instanceof Int8Array || N("Cannot pass non-string to std::string"), i && m ? c = Be(u) : c = u.length;
        var f = Et(4 + c + 1), d = f + 4;
        if (d >>>= 0, W[f >>> 2] = c, i && m)
          Xe(u, d, c + 1);
        else if (m)
          for (var y = 0; y < c; ++y) {
            var k = u.charCodeAt(y);
            k > 255 && (Se(d), N("String has UTF-16 code units that do not fit in 8 bits")), te[d + y >>> 0] = k;
          }
        else
          for (var y = 0; y < c; ++y)
            te[d + y >>> 0] = u[y];
        return s !== null && s.push(Se, f), f;
      }, argPackAdvance: 8, readValueFromPointer: nt, destructorFunction: function(s) {
        Se(s);
      } });
    }
    var Nn = typeof TextDecoder < "u" ? new TextDecoder("utf-16le") : void 0, pi = (n, a) => {
      for (var i = n, s = i >> 1, u = s + a / 2; !(s >= u) && Ze[s >>> 0]; ) ++s;
      if (i = s << 1, i - n > 32 && Nn) return Nn.decode(te.subarray(n >>> 0, i >>> 0));
      for (var c = "", m = 0; !(m >= a / 2); ++m) {
        var f = se[n + m * 2 >>> 1];
        if (f == 0) break;
        c += String.fromCharCode(f);
      }
      return c;
    }, di = (n, a, i) => {
      if (i === void 0 && (i = 2147483647), i < 2) return 0;
      i -= 2;
      for (var s = a, u = i < n.length * 2 ? i / 2 : n.length, c = 0; c < u; ++c) {
        var m = n.charCodeAt(c);
        se[a >>> 1] = m, a += 2;
      }
      return se[a >>> 1] = 0, a - s;
    }, hi = (n) => n.length * 2, yi = (n, a) => {
      for (var i = 0, s = ""; !(i >= a / 4); ) {
        var u = b[n + i * 4 >>> 2];
        if (u == 0) break;
        if (++i, u >= 65536) {
          var c = u - 65536;
          s += String.fromCharCode(55296 | c >> 10, 56320 | c & 1023);
        } else
          s += String.fromCharCode(u);
      }
      return s;
    }, wi = (n, a, i) => {
      if (a >>>= 0, i === void 0 && (i = 2147483647), i < 4) return 0;
      for (var s = a, u = s + i - 4, c = 0; c < n.length; ++c) {
        var m = n.charCodeAt(c);
        if (m >= 55296 && m <= 57343) {
          var f = n.charCodeAt(++c);
          m = 65536 + ((m & 1023) << 10) | f & 1023;
        }
        if (b[a >>> 2] = m, a += 4, a + 4 > u) break;
      }
      return b[a >>> 2] = 0, a - s;
    }, Si = (n) => {
      for (var a = 0, i = 0; i < n.length; ++i) {
        var s = n.charCodeAt(i);
        s >= 55296 && s <= 57343 && ++i, a += 4;
      }
      return a;
    }, ki = function(n, a, i) {
      i = ee(i);
      var s, u, c, m, f;
      a === 2 ? (s = pi, u = di, m = hi, c = () => Ze, f = 1) : a === 4 && (s = yi, u = wi, m = Si, c = () => W, f = 2), me(n, { name: i, fromWireType: function(d) {
        for (var y = W[d >>> 2], k = c(), D, M = d + 4, I = 0; I <= y; ++I) {
          var R = d + 4 + I * a;
          if (I == y || k[R >>> f] == 0) {
            var $ = R - M, q = s(M, $);
            D === void 0 ? D = q : (D += "\0", D += q), M = R + a;
          }
        }
        return Se(d), D;
      }, toWireType: function(d, y) {
        typeof y != "string" && N(`Cannot pass non-string to C++ string type ${i}`);
        var k = m(y), D = Et(4 + k + a);
        return D >>>= 0, W[D >>> 2] = k >> f, u(y, D + 4, k + a), d !== null && d.push(Se, D), D;
      }, argPackAdvance: 8, readValueFromPointer: nt, destructorFunction: function(d) {
        Se(d);
      } });
    };
    function vi(n, a, i, s, u, c) {
      vt[n] = { name: ee(a), rawConstructor: we(i, s), rawDestructor: we(u, c), fields: [] };
    }
    function Mi(n, a, i, s, u, c, m, f, d, y) {
      vt[n].fields.push({ fieldName: ee(a), getterReturnType: i, getter: we(s, u), getterContext: c, setterArgumentType: m, setter: we(f, d), setterContext: y });
    }
    function Ii(n, a) {
      a = ee(a), me(n, { isVoid: !0, name: a, argPackAdvance: 0, fromWireType: function() {
      }, toWireType: function(i, s) {
      } });
    }
    var Di = !0, Gi = () => Di, bi = () => {
      throw 1 / 0;
    }, Pi = {};
    function Hn(n) {
      var a = Pi[n];
      return a === void 0 ? ee(n) : a;
    }
    var Zt = [];
    function Ai(n, a, i, s) {
      n = Zt[n], a = fe.toValue(a), i = Hn(i), n(a, i, null, s);
    }
    function Ei(n) {
      var a = Zt.length;
      return Zt.push(n), a;
    }
    function Ti(n, a) {
      for (var i = new Array(n), s = 0; s < n; ++s)
        i[s] = Kt(W[a + s * 4 >>> 2], "parameter " + s);
      return i;
    }
    var Un = [];
    function Ri(n, a) {
      var i = Ti(n, a), s = i[0], u = s.name + "_$" + i.slice(1).map(function(R) {
        return R.name;
      }).join("_") + "$", c = Un[u];
      if (c !== void 0)
        return c;
      for (var m = ["retType"], f = [s], d = "", y = 0; y < n - 1; ++y)
        d += (y !== 0 ? ", " : "") + "arg" + y, m.push("argType" + y), f.push(i[1 + y]);
      for (var k = It("methodCaller_" + u), D = "return function " + k + `(handle, name, destructors, args) {
`, M = 0, y = 0; y < n - 1; ++y)
        D += "    var arg" + y + " = argType" + y + ".readValueFromPointer(args" + (M ? "+" + M : "") + `);
`, M += i[y + 1].argPackAdvance;
      D += "    var rv = handle[name](" + d + `);
`;
      for (var y = 0; y < n - 1; ++y)
        i[y + 1].deleteObject && (D += "    argType" + y + ".deleteObject(arg" + y + `);
`);
      s.isVoid || (D += `    return retType.toWireType(destructors, rv);
`), D += `};
`, m.push(D);
      var I = zn(Function, m).apply(null, f);
      return c = Ei(I), Un[u] = c, c;
    }
    function Ci(n) {
      n > 4 && (le.get(n).refcount += 1);
    }
    function Wi() {
      return fe.toHandle([]);
    }
    function Bi(n) {
      return fe.toHandle(Hn(n));
    }
    function Li() {
      return fe.toHandle({});
    }
    function xi(n, a, i) {
      n = fe.toValue(n), a = fe.toValue(a), i = fe.toValue(i), n[a] = i;
    }
    function zi(n, a) {
      n = Kt(n, "_emval_take_value");
      var i = n.readValueFromPointer(a);
      return fe.toHandle(i);
    }
    function Fn(n) {
      return W[n >>> 2] + b[n + 4 >>> 2] * 4294967296;
    }
    var Ni = (n, a) => {
      var i = new Date(Fn(n) * 1e3);
      b[a >>> 2] = i.getUTCSeconds(), b[a + 4 >>> 2] = i.getUTCMinutes(), b[a + 8 >>> 2] = i.getUTCHours(), b[a + 12 >>> 2] = i.getUTCDate(), b[a + 16 >>> 2] = i.getUTCMonth(), b[a + 20 >>> 2] = i.getUTCFullYear() - 1900, b[a + 24 >>> 2] = i.getUTCDay();
      var s = Date.UTC(i.getUTCFullYear(), 0, 1, 0, 0, 0, 0), u = (i.getTime() - s) / (1e3 * 60 * 60 * 24) | 0;
      b[a + 28 >>> 2] = u;
    }, lt = (n) => n % 4 === 0 && (n % 100 !== 0 || n % 400 === 0), Hi = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], Ui = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334], $n = (n) => {
      var a = lt(n.getFullYear()), i = a ? Hi : Ui, s = i[n.getMonth()] + n.getDate() - 1;
      return s;
    }, Fi = (n, a) => {
      var i = new Date(Fn(n) * 1e3);
      b[a >>> 2] = i.getSeconds(), b[a + 4 >>> 2] = i.getMinutes(), b[a + 8 >>> 2] = i.getHours(), b[a + 12 >>> 2] = i.getDate(), b[a + 16 >>> 2] = i.getMonth(), b[a + 20 >>> 2] = i.getFullYear() - 1900, b[a + 24 >>> 2] = i.getDay();
      var s = $n(i) | 0;
      b[a + 28 >>> 2] = s, b[a + 36 >>> 2] = -(i.getTimezoneOffset() * 60);
      var u = new Date(i.getFullYear(), 0, 1), c = new Date(i.getFullYear(), 6, 1).getTimezoneOffset(), m = u.getTimezoneOffset(), f = (c != m && i.getTimezoneOffset() == Math.min(m, c)) | 0;
      b[a + 32 >>> 2] = f;
    }, $i = (n) => {
      var a = new Date(b[n + 20 >>> 2] + 1900, b[n + 16 >>> 2], b[n + 12 >>> 2], b[n + 8 >>> 2], b[n + 4 >>> 2], b[n >>> 2], 0), i = b[n + 32 >>> 2], s = a.getTimezoneOffset(), u = new Date(a.getFullYear(), 0, 1), c = new Date(a.getFullYear(), 6, 1).getTimezoneOffset(), m = u.getTimezoneOffset(), f = Math.min(m, c);
      if (i < 0)
        b[n + 32 >>> 2] = +(c != m && f == s);
      else if (i > 0 != (f == s)) {
        var d = Math.max(m, c), y = i > 0 ? f : d;
        a.setTime(a.getTime() + (y - s) * 6e4);
      }
      b[n + 24 >>> 2] = a.getDay();
      var k = $n(a) | 0;
      return b[n + 28 >>> 2] = k, b[n >>> 2] = a.getSeconds(), b[n + 4 >>> 2] = a.getMinutes(), b[n + 8 >>> 2] = a.getHours(), b[n + 12 >>> 2] = a.getDate(), b[n + 16 >>> 2] = a.getMonth(), b[n + 20 >>> 2] = a.getYear(), a.getTime() / 1e3 | 0;
    };
    function Yi(n, a, i, s, u, c, m) {
      try {
        if (u = xe(u), isNaN(u)) return -61;
        var f = E.getStreamFromFD(s), d = _.mmap(f, n, u, a, i), y = d.ptr;
        return b[c >>> 2] = d.allocated, y >>>= 0, W[m >>> 2] = y, 0;
      } catch (k) {
        if (typeof _ > "u" || k.name !== "ErrnoError") throw k;
        return -k.errno;
      }
    }
    function ji(n, a, i, s, u, c) {
      try {
        if (c = xe(c), isNaN(c)) return -61;
        var m = E.getStreamFromFD(u);
        i & 2 && E.doMsync(n, m, a, s, c), _.munmap(m);
      } catch (f) {
        if (typeof _ > "u" || f.name !== "ErrnoError") throw f;
        return -f.errno;
      }
    }
    var Yn = (n) => {
      var a = Be(n) + 1, i = Et(a);
      return i && Xe(n, i, a), i;
    }, Xi = (n, a, i) => {
      var s = (/* @__PURE__ */ new Date()).getFullYear(), u = new Date(s, 0, 1), c = new Date(s, 6, 1), m = u.getTimezoneOffset(), f = c.getTimezoneOffset(), d = Math.max(m, f);
      W[n >>> 2] = d * 60, b[a >>> 2] = +(m != f);
      function y(R) {
        var $ = R.toTimeString().match(/\(([A-Za-z ]+)\)$/);
        return $ ? $[1] : "GMT";
      }
      var k = y(u), D = y(c), M = Yn(k), I = Yn(D);
      f < m ? (W[i >>> 2] = M, W[i + 4 >>> 2] = I) : (W[i >>> 2] = I, W[i + 4 >>> 2] = M);
    }, Vi = () => {
      de("");
    };
    function qi() {
      return Date.now();
    }
    var jn = () => 4294901760, Qi = () => jn(), Xn;
    Xn = () => performance.now();
    var Ji = (n, a, i) => te.copyWithin(n >>> 0, a >>> 0, a + i >>> 0), Ki = (n) => {
      var a = ht.buffer, i = n - a.byteLength + 65535 >>> 16;
      try {
        return ht.grow(i), mn(), 1;
      } catch {
      }
    }, Zi = (n) => {
      var a = te.length;
      n = n >>> 0;
      var i = jn();
      if (n > i)
        return !1;
      for (var s = (d, y) => d + (y - d % y) % y, u = 1; u <= 4; u *= 2) {
        var c = a * (1 + 0.2 / u);
        c = Math.min(c, n + 100663296);
        var m = Math.min(i, s(Math.max(n, c), 65536)), f = Ki(m);
        if (f)
          return !0;
      }
      return !1;
    }, Ot = {}, Oi = () => h || "./this.program", ct = () => {
      if (!ct.strings) {
        var n = (typeof navigator == "object" && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8", a = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: n, _: Oi() };
        for (var i in Ot)
          Ot[i] === void 0 ? delete a[i] : a[i] = Ot[i];
        var s = [];
        for (var i in a)
          s.push(`${i}=${a[i]}`);
        ct.strings = s;
      }
      return ct.strings;
    }, es = (n, a) => {
      for (var i = 0; i < n.length; ++i)
        V[a++ >>> 0] = n.charCodeAt(i);
      V[a >>> 0] = 0;
    }, ts = (n, a) => {
      var i = 0;
      return ct().forEach(function(s, u) {
        var c = a + i;
        W[n + u * 4 >>> 2] = c, es(s, c), i += s.length + 1;
      }), 0;
    }, ns = (n, a) => {
      var i = ct();
      W[n >>> 2] = i.length;
      var s = 0;
      return i.forEach(function(u) {
        s += u.length + 1;
      }), W[a >>> 2] = s, 0;
    }, Vn = (n) => {
      Er() || (e.onExit && e.onExit(n), zt = !0), S(n, new Ur(n));
    }, rs = (n, a) => {
      Vn(n);
    }, as = rs;
    function is(n) {
      try {
        var a = E.getStreamFromFD(n);
        return _.close(a), 0;
      } catch (i) {
        if (typeof _ > "u" || i.name !== "ErrnoError") throw i;
        return i.errno;
      }
    }
    function ss(n, a) {
      try {
        var i = 0, s = 0, u = 0, c = E.getStreamFromFD(n), m = c.tty ? 2 : _.isDir(c.mode) ? 3 : _.isLink(c.mode) ? 7 : 4;
        return V[a >>> 0] = m, se[a + 2 >>> 1] = u, ue[a + 8 >> 3] = BigInt(i), ue[a + 16 >> 3] = BigInt(s), 0;
      } catch (f) {
        if (typeof _ > "u" || f.name !== "ErrnoError") throw f;
        return f.errno;
      }
    }
    var qn = (n, a, i, s) => {
      for (var u = 0, c = 0; c < i; c++) {
        var m = W[a >>> 2], f = W[a + 4 >>> 2];
        a += 8;
        var d = _.read(n, V, m, f, s);
        if (d < 0) return -1;
        if (u += d, d < f) break;
        typeof s < "u" && (s += d);
      }
      return u;
    };
    function us(n, a, i, s, u) {
      try {
        if (s = xe(s), isNaN(s)) return 61;
        var c = E.getStreamFromFD(n), m = qn(c, a, i, s);
        return W[u >>> 2] = m, 0;
      } catch (f) {
        if (typeof _ > "u" || f.name !== "ErrnoError") throw f;
        return f.errno;
      }
    }
    var Qn = (n, a, i, s) => {
      for (var u = 0, c = 0; c < i; c++) {
        var m = W[a >>> 2], f = W[a + 4 >>> 2];
        a += 8;
        var d = _.write(n, V, m, f, s);
        if (d < 0) return -1;
        u += d, typeof s < "u" && (s += d);
      }
      return u;
    };
    function os(n, a, i, s, u) {
      try {
        if (s = xe(s), isNaN(s)) return 61;
        var c = E.getStreamFromFD(n), m = Qn(c, a, i, s);
        return W[u >>> 2] = m, 0;
      } catch (f) {
        if (typeof _ > "u" || f.name !== "ErrnoError") throw f;
        return f.errno;
      }
    }
    function _s(n, a, i, s) {
      try {
        var u = E.getStreamFromFD(n), c = qn(u, a, i);
        return W[s >>> 2] = c, 0;
      } catch (m) {
        if (typeof _ > "u" || m.name !== "ErrnoError") throw m;
        return m.errno;
      }
    }
    function ls(n, a, i, s) {
      try {
        if (a = xe(a), isNaN(a)) return 61;
        var u = E.getStreamFromFD(n);
        return _.llseek(u, a, i), ue[s >> 3] = BigInt(u.position), u.getdents && a === 0 && i === 0 && (u.getdents = null), 0;
      } catch (c) {
        if (typeof _ > "u" || c.name !== "ErrnoError") throw c;
        return c.errno;
      }
    }
    function cs(n) {
      try {
        var a = E.getStreamFromFD(n);
        return a.stream_ops && a.stream_ops.fsync ? a.stream_ops.fsync(a) : 0;
      } catch (i) {
        if (typeof _ > "u" || i.name !== "ErrnoError") throw i;
        return i.errno;
      }
    }
    function gs(n, a, i, s) {
      try {
        var u = E.getStreamFromFD(n), c = Qn(u, a, i);
        return W[s >>> 2] = c, 0;
      } catch (m) {
        if (typeof _ > "u" || m.name !== "ErrnoError") throw m;
        return m.errno;
      }
    }
    var ms = (n, a) => (Ut(te.subarray(n >>> 0, n + a >>> 0)), 0), fs = (n, a) => {
      for (var i = 0, s = 0; s <= a; i += n[s++])
        ;
      return i;
    }, Jn = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], Kn = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], ps = (n, a) => {
      for (var i = new Date(n.getTime()); a > 0; ) {
        var s = lt(i.getFullYear()), u = i.getMonth(), c = (s ? Jn : Kn)[u];
        if (a > c - i.getDate())
          a -= c - i.getDate() + 1, i.setDate(1), u < 11 ? i.setMonth(u + 1) : (i.setMonth(0), i.setFullYear(i.getFullYear() + 1));
        else
          return i.setDate(i.getDate() + a), i;
      }
      return i;
    }, ds = (n, a) => {
      V.set(n, a >>> 0);
    }, Zn = (n, a, i, s) => {
      var u = b[s + 40 >>> 2], c = { tm_sec: b[s >>> 2], tm_min: b[s + 4 >>> 2], tm_hour: b[s + 8 >>> 2], tm_mday: b[s + 12 >>> 2], tm_mon: b[s + 16 >>> 2], tm_year: b[s + 20 >>> 2], tm_wday: b[s + 24 >>> 2], tm_yday: b[s + 28 >>> 2], tm_isdst: b[s + 32 >>> 2], tm_gmtoff: b[s + 36 >>> 2], tm_zone: u ? tt(u) : "" }, m = tt(i), f = { "%c": "%a %b %d %H:%M:%S %Y", "%D": "%m/%d/%y", "%F": "%Y-%m-%d", "%h": "%b", "%r": "%I:%M:%S %p", "%R": "%H:%M", "%T": "%H:%M:%S", "%x": "%m/%d/%y", "%X": "%H:%M:%S", "%Ec": "%c", "%EC": "%C", "%Ex": "%m/%d/%y", "%EX": "%H:%M:%S", "%Ey": "%y", "%EY": "%Y", "%Od": "%d", "%Oe": "%e", "%OH": "%H", "%OI": "%I", "%Om": "%m", "%OM": "%M", "%OS": "%S", "%Ou": "%u", "%OU": "%U", "%OV": "%V", "%Ow": "%w", "%OW": "%W", "%Oy": "%y" };
      for (var d in f)
        m = m.replace(new RegExp(d, "g"), f[d]);
      var y = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], k = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      function D(v, P, O) {
        for (var X = typeof v == "number" ? v.toString() : v || ""; X.length < P; )
          X = O[0] + X;
        return X;
      }
      function M(v, P) {
        return D(v, P, "0");
      }
      function I(v, P) {
        function O(oe) {
          return oe < 0 ? -1 : oe > 0 ? 1 : 0;
        }
        var X;
        return (X = O(v.getFullYear() - P.getFullYear())) === 0 && (X = O(v.getMonth() - P.getMonth())) === 0 && (X = O(v.getDate() - P.getDate())), X;
      }
      function R(v) {
        switch (v.getDay()) {
          case 0:
            return new Date(v.getFullYear() - 1, 11, 29);
          case 1:
            return v;
          case 2:
            return new Date(v.getFullYear(), 0, 3);
          case 3:
            return new Date(v.getFullYear(), 0, 2);
          case 4:
            return new Date(v.getFullYear(), 0, 1);
          case 5:
            return new Date(v.getFullYear() - 1, 11, 31);
          case 6:
            return new Date(v.getFullYear() - 1, 11, 30);
        }
      }
      function $(v) {
        var P = ps(new Date(v.tm_year + 1900, 0, 1), v.tm_yday), O = new Date(P.getFullYear(), 0, 4), X = new Date(P.getFullYear() + 1, 0, 4), oe = R(O), J = R(X);
        return I(oe, P) <= 0 ? I(J, P) <= 0 ? P.getFullYear() + 1 : P.getFullYear() : P.getFullYear() - 1;
      }
      var q = { "%a": (v) => y[v.tm_wday].substring(0, 3), "%A": (v) => y[v.tm_wday], "%b": (v) => k[v.tm_mon].substring(0, 3), "%B": (v) => k[v.tm_mon], "%C": (v) => {
        var P = v.tm_year + 1900;
        return M(P / 100 | 0, 2);
      }, "%d": (v) => M(v.tm_mday, 2), "%e": (v) => D(v.tm_mday, 2, " "), "%g": (v) => $(v).toString().substring(2), "%G": (v) => $(v), "%H": (v) => M(v.tm_hour, 2), "%I": (v) => {
        var P = v.tm_hour;
        return P == 0 ? P = 12 : P > 12 && (P -= 12), M(P, 2);
      }, "%j": (v) => M(v.tm_mday + fs(lt(v.tm_year + 1900) ? Jn : Kn, v.tm_mon - 1), 3), "%m": (v) => M(v.tm_mon + 1, 2), "%M": (v) => M(v.tm_min, 2), "%n": () => `
`, "%p": (v) => v.tm_hour >= 0 && v.tm_hour < 12 ? "AM" : "PM", "%S": (v) => M(v.tm_sec, 2), "%t": () => "	", "%u": (v) => v.tm_wday || 7, "%U": (v) => {
        var P = v.tm_yday + 7 - v.tm_wday;
        return M(Math.floor(P / 7), 2);
      }, "%V": (v) => {
        var P = Math.floor((v.tm_yday + 7 - (v.tm_wday + 6) % 7) / 7);
        if ((v.tm_wday + 371 - v.tm_yday - 2) % 7 <= 2 && P++, P) {
          if (P == 53) {
            var X = (v.tm_wday + 371 - v.tm_yday) % 7;
            X != 4 && (X != 3 || !lt(v.tm_year)) && (P = 1);
          }
        } else {
          P = 52;
          var O = (v.tm_wday + 7 - v.tm_yday - 1) % 7;
          (O == 4 || O == 5 && lt(v.tm_year % 400 - 1)) && P++;
        }
        return M(P, 2);
      }, "%w": (v) => v.tm_wday, "%W": (v) => {
        var P = v.tm_yday + 7 - (v.tm_wday + 6) % 7;
        return M(Math.floor(P / 7), 2);
      }, "%y": (v) => (v.tm_year + 1900).toString().substring(2), "%Y": (v) => v.tm_year + 1900, "%z": (v) => {
        var P = v.tm_gmtoff, O = P >= 0;
        return P = Math.abs(P) / 60, P = P / 60 * 100 + P % 60, (O ? "+" : "-") + ("0000" + P).slice(-4);
      }, "%Z": (v) => v.tm_zone, "%%": () => "%" };
      m = m.replace(/%%/g, "\0\0");
      for (var d in q)
        m.includes(d) && (m = m.replace(new RegExp(d, "g"), q[d](c)));
      m = m.replace(/\0\0/g, "%");
      var j = kt(m, !1);
      return j.length > a ? 0 : (ds(j, n), j.length - 1);
    }, hs = (n, a, i, s, u) => Zn(n, a, i, s), ys = (n) => n ? (In(52), -1) : 0;
    function On(n, a) {
      n < 128 ? a.push(n) : a.push(n % 128 | 128, n >> 7);
    }
    function ws(n) {
      for (var a = { i: "i32", j: "i64", f: "f32", d: "f64", p: "i32" }, i = { parameters: [], results: n[0] == "v" ? [] : [a[n[0]]] }, s = 1; s < n.length; ++s)
        i.parameters.push(a[n[s]]);
      return i;
    }
    function Ss(n, a) {
      var i = n.slice(0, 1), s = n.slice(1), u = { i: 127, p: 127, j: 126, f: 125, d: 124 };
      a.push(96), On(s.length, a);
      for (var c = 0; c < s.length; ++c)
        a.push(u[s[c]]);
      i == "v" ? a.push(0) : a.push(1, u[i]);
    }
    function ks(n, a) {
      if (typeof WebAssembly.Function == "function")
        return new WebAssembly.Function(ws(a), n);
      var i = [1];
      Ss(a, i);
      var s = [0, 97, 115, 109, 1, 0, 0, 0, 1];
      On(i.length, s), s.push.apply(s, i), s.push(2, 7, 1, 1, 101, 1, 102, 0, 0, 7, 5, 1, 1, 102, 0, 0);
      var u = new WebAssembly.Module(new Uint8Array(s)), c = new WebAssembly.Instance(u, { e: { f: n } }), m = c.exports.f;
      return m;
    }
    function vs(n, a) {
      if (qe)
        for (var i = n; i < n + a; i++) {
          var s = z(i);
          s && qe.set(s, i);
        }
    }
    var qe = void 0;
    function Ms(n) {
      return qe || (qe = /* @__PURE__ */ new WeakMap(), vs(0, Ce.length)), qe.get(n) || 0;
    }
    var er = [];
    function Is() {
      if (er.length)
        return er.pop();
      try {
        Ce.grow(1);
      } catch (n) {
        throw n instanceof RangeError ? "Unable to grow wasm table. Set ALLOW_TABLE_GROWTH." : n;
      }
      return Ce.length - 1;
    }
    var tr = (n, a) => {
      Ce.set(n, a), et[n] = Ce.get(n);
    };
    function Ds(n, a) {
      var i = Ms(n);
      if (i)
        return i;
      var s = Is();
      try {
        tr(s, n);
      } catch (c) {
        if (!(c instanceof TypeError))
          throw c;
        var u = ks(n, a);
        tr(s, u);
      }
      return qe.set(n, s), s;
    }
    var nr = function(n, a, i, s) {
      n || (n = this), this.parent = n, this.mount = n.mount, this.mounted = null, this.id = _.nextInode++, this.name = a, this.mode = i, this.node_ops = {}, this.stream_ops = {}, this.rdev = s;
    }, Pt = 365, At = 146;
    Object.defineProperties(nr.prototype, { read: { get: function() {
      return (this.mode & Pt) === Pt;
    }, set: function(n) {
      n ? this.mode |= Pt : this.mode &= ~Pt;
    } }, write: { get: function() {
      return (this.mode & At) === At;
    }, set: function(n) {
      n ? this.mode |= At : this.mode &= ~At;
    } }, isFolder: { get: function() {
      return _.isDir(this.mode);
    } }, isDevice: { get: function() {
      return _.isChrdev(this.mode);
    } } }), _.FSNode = nr, _.createPreloadedFile = ta, _.staticInit(), Gn = e.InternalError = Yt(Error, "InternalError"), Ga(), at = e.BindingError = Yt(Error, "BindingError"), $a(), Ba(), Za(), Wn = e.UnboundTypeError = Yt(Error, "UnboundTypeError"), ni();
    var Gs = { ga: Yr, H: Vr, a: qr, G: jr, ya: ra, za: aa, ja: ua, va: oa, K: _a, S: la, qa: ca, fa: ga, Ba: ma, sa: fa, ta: pa, I: da, ea: ha, _a: ya, $a: wa, ua: Sa, Za: ka, Q: va, Na: Da, W: ba, Fa: Pa, N: Oa, Ea: ri, x: ii, f: si, V: oi, q: ci, w: gi, o: mi, U: fi, L: ki, Oa: vi, M: Mi, Ga: Ii, wa: Gi, Va: bi, La: Ai, m: xn, Ma: Ri, E: Ci, Y: Wi, v: Bi, F: Li, t: xi, p: zi, ma: Ni, na: Fi, oa: $i, ka: Yi, la: ji, Xa: Xi, c: Vi, z: qi, Ya: Qi, D: Xn, xa: Ji, Wa: Zi, Ca: ts, Da: ns, y: as, B: is, R: ss, ia: us, ha: os, T: _s, pa: ls, ra: cs, J: gs, da: ms, Qa: Ys, P: zs, e: Es, d: As, g: Ps, i: Ws, ca: $s, b: Ns, ba: Vs, n: xs, aa: qs, Ka: eu, Ja: tu, r: Hs, Sa: Us, u: Ls, Ta: Bs, O: js, l: Ts, h: Rs, $: Qs, _: Js, j: bs, k: Cs, s: Xs, Pa: Zs, X: Os, Ia: nu, Z: Ks, Ha: ru, Ra: Fs, Aa: Vn, C: Zn, Ua: hs, A: ys };
    Hr(), e._MagickColor_Create = function() {
      return (e._MagickColor_Create = e.asm.cb).apply(null, arguments);
    }, e._MagickColor_Dispose = function() {
      return (e._MagickColor_Dispose = e.asm.db).apply(null, arguments);
    }, e._MagickColor_Count_Get = function() {
      return (e._MagickColor_Count_Get = e.asm.eb).apply(null, arguments);
    }, e._MagickColor_Red_Get = function() {
      return (e._MagickColor_Red_Get = e.asm.fb).apply(null, arguments);
    }, e._MagickColor_Red_Set = function() {
      return (e._MagickColor_Red_Set = e.asm.gb).apply(null, arguments);
    }, e._MagickColor_Green_Get = function() {
      return (e._MagickColor_Green_Get = e.asm.hb).apply(null, arguments);
    }, e._MagickColor_Green_Set = function() {
      return (e._MagickColor_Green_Set = e.asm.ib).apply(null, arguments);
    }, e._MagickColor_Blue_Get = function() {
      return (e._MagickColor_Blue_Get = e.asm.jb).apply(null, arguments);
    }, e._MagickColor_Blue_Set = function() {
      return (e._MagickColor_Blue_Set = e.asm.kb).apply(null, arguments);
    }, e._MagickColor_Alpha_Get = function() {
      return (e._MagickColor_Alpha_Get = e.asm.lb).apply(null, arguments);
    }, e._MagickColor_Alpha_Set = function() {
      return (e._MagickColor_Alpha_Set = e.asm.mb).apply(null, arguments);
    }, e._MagickColor_Black_Get = function() {
      return (e._MagickColor_Black_Get = e.asm.nb).apply(null, arguments);
    }, e._MagickColor_Black_Set = function() {
      return (e._MagickColor_Black_Set = e.asm.ob).apply(null, arguments);
    }, e._MagickColor_IsCMYK_Get = function() {
      return (e._MagickColor_IsCMYK_Get = e.asm.pb).apply(null, arguments);
    }, e._MagickColor_IsCMYK_Set = function() {
      return (e._MagickColor_IsCMYK_Set = e.asm.qb).apply(null, arguments);
    }, e._MagickColor_Clone = function() {
      return (e._MagickColor_Clone = e.asm.rb).apply(null, arguments);
    }, e._MagickColor_FuzzyEquals = function() {
      return (e._MagickColor_FuzzyEquals = e.asm.sb).apply(null, arguments);
    }, e._MagickColor_Initialize = function() {
      return (e._MagickColor_Initialize = e.asm.tb).apply(null, arguments);
    }, e._MagickColorCollection_DisposeList = function() {
      return (e._MagickColorCollection_DisposeList = e.asm.vb).apply(null, arguments);
    }, e._MagickColorCollection_GetInstance = function() {
      return (e._MagickColorCollection_GetInstance = e.asm.wb).apply(null, arguments);
    }, e._DrawingWand_Create = function() {
      return (e._DrawingWand_Create = e.asm.xb).apply(null, arguments);
    }, e._DrawingWand_Dispose = function() {
      return (e._DrawingWand_Dispose = e.asm.yb).apply(null, arguments);
    }, e._DrawingWand_Affine = function() {
      return (e._DrawingWand_Affine = e.asm.zb).apply(null, arguments);
    }, e._DrawingWand_Alpha = function() {
      return (e._DrawingWand_Alpha = e.asm.Ab).apply(null, arguments);
    }, e._DrawingWand_Arc = function() {
      return (e._DrawingWand_Arc = e.asm.Bb).apply(null, arguments);
    }, e._DrawingWand_Bezier = function() {
      return (e._DrawingWand_Bezier = e.asm.Cb).apply(null, arguments);
    }, e._DrawingWand_BorderColor = function() {
      return (e._DrawingWand_BorderColor = e.asm.Db).apply(null, arguments);
    }, e._DrawingWand_Circle = function() {
      return (e._DrawingWand_Circle = e.asm.Eb).apply(null, arguments);
    }, e._DrawingWand_ClipPath = function() {
      return (e._DrawingWand_ClipPath = e.asm.Fb).apply(null, arguments);
    }, e._DrawingWand_ClipRule = function() {
      return (e._DrawingWand_ClipRule = e.asm.Gb).apply(null, arguments);
    }, e._DrawingWand_ClipUnits = function() {
      return (e._DrawingWand_ClipUnits = e.asm.Hb).apply(null, arguments);
    }, e._DrawingWand_Color = function() {
      return (e._DrawingWand_Color = e.asm.Ib).apply(null, arguments);
    }, e._DrawingWand_Composite = function() {
      return (e._DrawingWand_Composite = e.asm.Jb).apply(null, arguments);
    }, e._DrawingWand_Density = function() {
      return (e._DrawingWand_Density = e.asm.Kb).apply(null, arguments);
    }, e._DrawingWand_Ellipse = function() {
      return (e._DrawingWand_Ellipse = e.asm.Lb).apply(null, arguments);
    }, e._DrawingWand_FillColor = function() {
      return (e._DrawingWand_FillColor = e.asm.Mb).apply(null, arguments);
    }, e._DrawingWand_FillOpacity = function() {
      return (e._DrawingWand_FillOpacity = e.asm.Nb).apply(null, arguments);
    }, e._DrawingWand_FillPatternUrl = function() {
      return (e._DrawingWand_FillPatternUrl = e.asm.Ob).apply(null, arguments);
    }, e._DrawingWand_FillRule = function() {
      return (e._DrawingWand_FillRule = e.asm.Pb).apply(null, arguments);
    }, e._DrawingWand_Font = function() {
      return (e._DrawingWand_Font = e.asm.Qb).apply(null, arguments);
    }, e._DrawingWand_FontFamily = function() {
      return (e._DrawingWand_FontFamily = e.asm.Rb).apply(null, arguments);
    }, e._DrawingWand_FontPointSize = function() {
      return (e._DrawingWand_FontPointSize = e.asm.Sb).apply(null, arguments);
    }, e._DrawingWand_FontTypeMetrics = function() {
      return (e._DrawingWand_FontTypeMetrics = e.asm.Tb).apply(null, arguments);
    }, e._TypeMetric_Create = function() {
      return (e._TypeMetric_Create = e.asm.Ub).apply(null, arguments);
    }, e._DrawingWand_Gravity = function() {
      return (e._DrawingWand_Gravity = e.asm.Vb).apply(null, arguments);
    }, e._DrawingWand_Line = function() {
      return (e._DrawingWand_Line = e.asm.Wb).apply(null, arguments);
    }, e._DrawingWand_PathArcAbs = function() {
      return (e._DrawingWand_PathArcAbs = e.asm.Xb).apply(null, arguments);
    }, e._DrawingWand_PathArcRel = function() {
      return (e._DrawingWand_PathArcRel = e.asm.Yb).apply(null, arguments);
    }, e._DrawingWand_PathClose = function() {
      return (e._DrawingWand_PathClose = e.asm.Zb).apply(null, arguments);
    }, e._DrawingWand_PathCurveToAbs = function() {
      return (e._DrawingWand_PathCurveToAbs = e.asm._b).apply(null, arguments);
    }, e._DrawingWand_PathCurveToRel = function() {
      return (e._DrawingWand_PathCurveToRel = e.asm.$b).apply(null, arguments);
    }, e._DrawingWand_PathFinish = function() {
      return (e._DrawingWand_PathFinish = e.asm.ac).apply(null, arguments);
    }, e._DrawingWand_PathLineToAbs = function() {
      return (e._DrawingWand_PathLineToAbs = e.asm.bc).apply(null, arguments);
    }, e._DrawingWand_PathLineToHorizontalAbs = function() {
      return (e._DrawingWand_PathLineToHorizontalAbs = e.asm.cc).apply(null, arguments);
    }, e._DrawingWand_PathLineToHorizontalRel = function() {
      return (e._DrawingWand_PathLineToHorizontalRel = e.asm.dc).apply(null, arguments);
    }, e._DrawingWand_PathLineToRel = function() {
      return (e._DrawingWand_PathLineToRel = e.asm.ec).apply(null, arguments);
    }, e._DrawingWand_PathLineToVerticalAbs = function() {
      return (e._DrawingWand_PathLineToVerticalAbs = e.asm.fc).apply(null, arguments);
    }, e._DrawingWand_PathLineToVerticalRel = function() {
      return (e._DrawingWand_PathLineToVerticalRel = e.asm.gc).apply(null, arguments);
    }, e._DrawingWand_PathMoveToAbs = function() {
      return (e._DrawingWand_PathMoveToAbs = e.asm.hc).apply(null, arguments);
    }, e._DrawingWand_PathMoveToRel = function() {
      return (e._DrawingWand_PathMoveToRel = e.asm.ic).apply(null, arguments);
    }, e._DrawingWand_PathQuadraticCurveToAbs = function() {
      return (e._DrawingWand_PathQuadraticCurveToAbs = e.asm.jc).apply(null, arguments);
    }, e._DrawingWand_PathQuadraticCurveToRel = function() {
      return (e._DrawingWand_PathQuadraticCurveToRel = e.asm.kc).apply(null, arguments);
    }, e._DrawingWand_PathSmoothCurveToAbs = function() {
      return (e._DrawingWand_PathSmoothCurveToAbs = e.asm.lc).apply(null, arguments);
    }, e._DrawingWand_PathSmoothCurveToRel = function() {
      return (e._DrawingWand_PathSmoothCurveToRel = e.asm.mc).apply(null, arguments);
    }, e._DrawingWand_PathSmoothQuadraticCurveToAbs = function() {
      return (e._DrawingWand_PathSmoothQuadraticCurveToAbs = e.asm.nc).apply(null, arguments);
    }, e._DrawingWand_PathSmoothQuadraticCurveToRel = function() {
      return (e._DrawingWand_PathSmoothQuadraticCurveToRel = e.asm.oc).apply(null, arguments);
    }, e._DrawingWand_PathStart = function() {
      return (e._DrawingWand_PathStart = e.asm.pc).apply(null, arguments);
    }, e._DrawingWand_Point = function() {
      return (e._DrawingWand_Point = e.asm.qc).apply(null, arguments);
    }, e._DrawingWand_Polygon = function() {
      return (e._DrawingWand_Polygon = e.asm.rc).apply(null, arguments);
    }, e._DrawingWand_Polyline = function() {
      return (e._DrawingWand_Polyline = e.asm.sc).apply(null, arguments);
    }, e._DrawingWand_PopClipPath = function() {
      return (e._DrawingWand_PopClipPath = e.asm.tc).apply(null, arguments);
    }, e._DrawingWand_PopGraphicContext = function() {
      return (e._DrawingWand_PopGraphicContext = e.asm.uc).apply(null, arguments);
    }, e._DrawingWand_PopPattern = function() {
      return (e._DrawingWand_PopPattern = e.asm.vc).apply(null, arguments);
    }, e._DrawingWand_PushClipPath = function() {
      return (e._DrawingWand_PushClipPath = e.asm.wc).apply(null, arguments);
    }, e._DrawingWand_PushGraphicContext = function() {
      return (e._DrawingWand_PushGraphicContext = e.asm.xc).apply(null, arguments);
    }, e._DrawingWand_PushPattern = function() {
      return (e._DrawingWand_PushPattern = e.asm.yc).apply(null, arguments);
    }, e._DrawingWand_Rectangle = function() {
      return (e._DrawingWand_Rectangle = e.asm.zc).apply(null, arguments);
    }, e._DrawingWand_Render = function() {
      return (e._DrawingWand_Render = e.asm.Ac).apply(null, arguments);
    }, e._DrawingWand_Rotation = function() {
      return (e._DrawingWand_Rotation = e.asm.Bc).apply(null, arguments);
    }, e._DrawingWand_RoundRectangle = function() {
      return (e._DrawingWand_RoundRectangle = e.asm.Cc).apply(null, arguments);
    }, e._DrawingWand_Scaling = function() {
      return (e._DrawingWand_Scaling = e.asm.Dc).apply(null, arguments);
    }, e._DrawingWand_SkewX = function() {
      return (e._DrawingWand_SkewX = e.asm.Ec).apply(null, arguments);
    }, e._DrawingWand_SkewY = function() {
      return (e._DrawingWand_SkewY = e.asm.Fc).apply(null, arguments);
    }, e._DrawingWand_StrokeAntialias = function() {
      return (e._DrawingWand_StrokeAntialias = e.asm.Gc).apply(null, arguments);
    }, e._DrawingWand_StrokeColor = function() {
      return (e._DrawingWand_StrokeColor = e.asm.Hc).apply(null, arguments);
    }, e._DrawingWand_StrokeDashArray = function() {
      return (e._DrawingWand_StrokeDashArray = e.asm.Ic).apply(null, arguments);
    }, e._DrawingWand_StrokeDashOffset = function() {
      return (e._DrawingWand_StrokeDashOffset = e.asm.Jc).apply(null, arguments);
    }, e._DrawingWand_StrokeLineCap = function() {
      return (e._DrawingWand_StrokeLineCap = e.asm.Kc).apply(null, arguments);
    }, e._DrawingWand_StrokeLineJoin = function() {
      return (e._DrawingWand_StrokeLineJoin = e.asm.Lc).apply(null, arguments);
    }, e._DrawingWand_StrokeMiterLimit = function() {
      return (e._DrawingWand_StrokeMiterLimit = e.asm.Mc).apply(null, arguments);
    }, e._DrawingWand_StrokeOpacity = function() {
      return (e._DrawingWand_StrokeOpacity = e.asm.Nc).apply(null, arguments);
    }, e._DrawingWand_StrokePatternUrl = function() {
      return (e._DrawingWand_StrokePatternUrl = e.asm.Oc).apply(null, arguments);
    }, e._DrawingWand_StrokeWidth = function() {
      return (e._DrawingWand_StrokeWidth = e.asm.Pc).apply(null, arguments);
    }, e._DrawingWand_Text = function() {
      return (e._DrawingWand_Text = e.asm.Qc).apply(null, arguments);
    }, e._DrawingWand_TextAlignment = function() {
      return (e._DrawingWand_TextAlignment = e.asm.Rc).apply(null, arguments);
    }, e._DrawingWand_TextAntialias = function() {
      return (e._DrawingWand_TextAntialias = e.asm.Sc).apply(null, arguments);
    }, e._DrawingWand_TextDecoration = function() {
      return (e._DrawingWand_TextDecoration = e.asm.Tc).apply(null, arguments);
    }, e._DrawingWand_TextDirection = function() {
      return (e._DrawingWand_TextDirection = e.asm.Uc).apply(null, arguments);
    }, e._DrawingWand_TextEncoding = function() {
      return (e._DrawingWand_TextEncoding = e.asm.Vc).apply(null, arguments);
    }, e._DrawingWand_TextInterlineSpacing = function() {
      return (e._DrawingWand_TextInterlineSpacing = e.asm.Wc).apply(null, arguments);
    }, e._DrawingWand_TextInterwordSpacing = function() {
      return (e._DrawingWand_TextInterwordSpacing = e.asm.Xc).apply(null, arguments);
    }, e._DrawingWand_TextKerning = function() {
      return (e._DrawingWand_TextKerning = e.asm.Yc).apply(null, arguments);
    }, e._DrawingWand_TextUnderColor = function() {
      return (e._DrawingWand_TextUnderColor = e.asm.Zc).apply(null, arguments);
    }, e._DrawingWand_Translation = function() {
      return (e._DrawingWand_Translation = e.asm._c).apply(null, arguments);
    }, e._DrawingWand_Viewbox = function() {
      return (e._DrawingWand_Viewbox = e.asm.$c).apply(null, arguments);
    }, e._MagickExceptionHelper_Description = function() {
      return (e._MagickExceptionHelper_Description = e.asm.ad).apply(null, arguments);
    }, e._MagickExceptionHelper_Dispose = function() {
      return (e._MagickExceptionHelper_Dispose = e.asm.bd).apply(null, arguments);
    }, e._MagickExceptionHelper_Related = function() {
      return (e._MagickExceptionHelper_Related = e.asm.cd).apply(null, arguments);
    }, e._MagickExceptionHelper_RelatedCount = function() {
      return (e._MagickExceptionHelper_RelatedCount = e.asm.dd).apply(null, arguments);
    }, e._MagickExceptionHelper_Message = function() {
      return (e._MagickExceptionHelper_Message = e.asm.ed).apply(null, arguments);
    }, e._MagickExceptionHelper_Severity = function() {
      return (e._MagickExceptionHelper_Severity = e.asm.fd).apply(null, arguments);
    }, e._PdfInfo_PageCount = function() {
      return (e._PdfInfo_PageCount = e.asm.gd).apply(null, arguments);
    }, e._Environment_Initialize = function() {
      return (e._Environment_Initialize = e.asm.hd).apply(null, arguments);
    }, e._Environment_GetEnv = function() {
      return (e._Environment_GetEnv = e.asm.id).apply(null, arguments);
    }, e._Environment_SetEnv = function() {
      return (e._Environment_SetEnv = e.asm.jd).apply(null, arguments);
    }, e._MagickMemory_Relinquish = function() {
      return (e._MagickMemory_Relinquish = e.asm.kd).apply(null, arguments);
    }, e._Magick_Delegates_Get = function() {
      return (e._Magick_Delegates_Get = e.asm.ld).apply(null, arguments);
    }, e._Magick_Features_Get = function() {
      return (e._Magick_Features_Get = e.asm.md).apply(null, arguments);
    }, e._Magick_ImageMagickVersion_Get = function() {
      return (e._Magick_ImageMagickVersion_Get = e.asm.nd).apply(null, arguments);
    }, e._Magick_GetFonts = function() {
      return (e._Magick_GetFonts = e.asm.od).apply(null, arguments);
    }, e._Magick_GetFontFamily = function() {
      return (e._Magick_GetFontFamily = e.asm.pd).apply(null, arguments);
    }, e._Magick_GetFontName = function() {
      return (e._Magick_GetFontName = e.asm.qd).apply(null, arguments);
    }, e._Magick_DisposeFonts = function() {
      return (e._Magick_DisposeFonts = e.asm.rd).apply(null, arguments);
    }, e._Magick_SetDefaultFontFile = function() {
      return (e._Magick_SetDefaultFontFile = e.asm.sd).apply(null, arguments);
    }, e._Magick_SetRandomSeed = function() {
      return (e._Magick_SetRandomSeed = e.asm.td).apply(null, arguments);
    }, e._Magick_SetLogDelegate = function() {
      return (e._Magick_SetLogDelegate = e.asm.ud).apply(null, arguments);
    }, e._Magick_SetLogEvents = function() {
      return (e._Magick_SetLogEvents = e.asm.vd).apply(null, arguments);
    }, e._MagickFormatInfo_CreateList = function() {
      return (e._MagickFormatInfo_CreateList = e.asm.wd).apply(null, arguments);
    }, e._MagickFormatInfo_DisposeList = function() {
      return (e._MagickFormatInfo_DisposeList = e.asm.xd).apply(null, arguments);
    }, e._MagickFormatInfo_CanReadMultithreaded_Get = function() {
      return (e._MagickFormatInfo_CanReadMultithreaded_Get = e.asm.yd).apply(null, arguments);
    }, e._MagickFormatInfo_CanWriteMultithreaded_Get = function() {
      return (e._MagickFormatInfo_CanWriteMultithreaded_Get = e.asm.zd).apply(null, arguments);
    }, e._MagickFormatInfo_Description_Get = function() {
      return (e._MagickFormatInfo_Description_Get = e.asm.Ad).apply(null, arguments);
    }, e._MagickFormatInfo_Format_Get = function() {
      return (e._MagickFormatInfo_Format_Get = e.asm.Bd).apply(null, arguments);
    }, e._MagickFormatInfo_MimeType_Get = function() {
      return (e._MagickFormatInfo_MimeType_Get = e.asm.Cd).apply(null, arguments);
    }, e._MagickFormatInfo_Module_Get = function() {
      return (e._MagickFormatInfo_Module_Get = e.asm.Dd).apply(null, arguments);
    }, e._MagickFormatInfo_SupportsMultipleFrames_Get = function() {
      return (e._MagickFormatInfo_SupportsMultipleFrames_Get = e.asm.Ed).apply(null, arguments);
    }, e._MagickFormatInfo_SupportsReading_Get = function() {
      return (e._MagickFormatInfo_SupportsReading_Get = e.asm.Fd).apply(null, arguments);
    }, e._MagickFormatInfo_SupportsWriting_Get = function() {
      return (e._MagickFormatInfo_SupportsWriting_Get = e.asm.Gd).apply(null, arguments);
    }, e._MagickFormatInfo_GetInfo = function() {
      return (e._MagickFormatInfo_GetInfo = e.asm.Hd).apply(null, arguments);
    }, e._MagickFormatInfo_GetInfoByName = function() {
      return (e._MagickFormatInfo_GetInfoByName = e.asm.Id).apply(null, arguments);
    }, e._MagickFormatInfo_GetInfoWithBlob = function() {
      return (e._MagickFormatInfo_GetInfoWithBlob = e.asm.Jd).apply(null, arguments);
    }, e._MagickFormatInfo_Unregister = function() {
      return (e._MagickFormatInfo_Unregister = e.asm.Kd).apply(null, arguments);
    }, e._MagickImage_Create = function() {
      return (e._MagickImage_Create = e.asm.Ld).apply(null, arguments);
    }, e._MagickImage_Dispose = function() {
      return (e._MagickImage_Dispose = e.asm.Md).apply(null, arguments);
    }, e._MagickImage_AnimationDelay_Get = function() {
      return (e._MagickImage_AnimationDelay_Get = e.asm.Nd).apply(null, arguments);
    }, e._MagickImage_AnimationDelay_Set = function() {
      return (e._MagickImage_AnimationDelay_Set = e.asm.Od).apply(null, arguments);
    }, e._MagickImage_AnimationIterations_Get = function() {
      return (e._MagickImage_AnimationIterations_Get = e.asm.Pd).apply(null, arguments);
    }, e._MagickImage_AnimationIterations_Set = function() {
      return (e._MagickImage_AnimationIterations_Set = e.asm.Qd).apply(null, arguments);
    }, e._MagickImage_AnimationTicksPerSecond_Get = function() {
      return (e._MagickImage_AnimationTicksPerSecond_Get = e.asm.Rd).apply(null, arguments);
    }, e._MagickImage_AnimationTicksPerSecond_Set = function() {
      return (e._MagickImage_AnimationTicksPerSecond_Set = e.asm.Sd).apply(null, arguments);
    }, e._MagickImage_BackgroundColor_Get = function() {
      return (e._MagickImage_BackgroundColor_Get = e.asm.Td).apply(null, arguments);
    }, e._MagickImage_BackgroundColor_Set = function() {
      return (e._MagickImage_BackgroundColor_Set = e.asm.Ud).apply(null, arguments);
    }, e._MagickImage_BaseHeight_Get = function() {
      return (e._MagickImage_BaseHeight_Get = e.asm.Vd).apply(null, arguments);
    }, e._MagickImage_BaseWidth_Get = function() {
      return (e._MagickImage_BaseWidth_Get = e.asm.Wd).apply(null, arguments);
    }, e._MagickImage_BlackPointCompensation_Get = function() {
      return (e._MagickImage_BlackPointCompensation_Get = e.asm.Xd).apply(null, arguments);
    }, e._MagickImage_BlackPointCompensation_Set = function() {
      return (e._MagickImage_BlackPointCompensation_Set = e.asm.Yd).apply(null, arguments);
    }, e._MagickImage_BorderColor_Get = function() {
      return (e._MagickImage_BorderColor_Get = e.asm.Zd).apply(null, arguments);
    }, e._MagickImage_BorderColor_Set = function() {
      return (e._MagickImage_BorderColor_Set = e.asm._d).apply(null, arguments);
    }, e._MagickImage_BoundingBox_Get = function() {
      return (e._MagickImage_BoundingBox_Get = e.asm.$d).apply(null, arguments);
    }, e._MagickRectangle_Create = function() {
      return (e._MagickRectangle_Create = e.asm.ae).apply(null, arguments);
    }, e._MagickImage_ChannelCount_Get = function() {
      return (e._MagickImage_ChannelCount_Get = e.asm.be).apply(null, arguments);
    }, e._MagickImage_ChromaBlue_Get = function() {
      return (e._MagickImage_ChromaBlue_Get = e.asm.ce).apply(null, arguments);
    }, e._PrimaryInfo_Create = function() {
      return (e._PrimaryInfo_Create = e.asm.de).apply(null, arguments);
    }, e._MagickImage_ChromaBlue_Set = function() {
      return (e._MagickImage_ChromaBlue_Set = e.asm.ee).apply(null, arguments);
    }, e._MagickImage_ChromaGreen_Get = function() {
      return (e._MagickImage_ChromaGreen_Get = e.asm.fe).apply(null, arguments);
    }, e._MagickImage_ChromaGreen_Set = function() {
      return (e._MagickImage_ChromaGreen_Set = e.asm.ge).apply(null, arguments);
    }, e._MagickImage_ChromaRed_Get = function() {
      return (e._MagickImage_ChromaRed_Get = e.asm.he).apply(null, arguments);
    }, e._MagickImage_ChromaRed_Set = function() {
      return (e._MagickImage_ChromaRed_Set = e.asm.ie).apply(null, arguments);
    }, e._MagickImage_ChromaWhite_Get = function() {
      return (e._MagickImage_ChromaWhite_Get = e.asm.je).apply(null, arguments);
    }, e._MagickImage_ChromaWhite_Set = function() {
      return (e._MagickImage_ChromaWhite_Set = e.asm.ke).apply(null, arguments);
    }, e._MagickImage_ClassType_Get = function() {
      return (e._MagickImage_ClassType_Get = e.asm.le).apply(null, arguments);
    }, e._MagickImage_ClassType_Set = function() {
      return (e._MagickImage_ClassType_Set = e.asm.me).apply(null, arguments);
    }, e._QuantizeSettings_Create = function() {
      return (e._QuantizeSettings_Create = e.asm.ne).apply(null, arguments);
    }, e._QuantizeSettings_Dispose = function() {
      return (e._QuantizeSettings_Dispose = e.asm.oe).apply(null, arguments);
    }, e._MagickImage_ColorFuzz_Get = function() {
      return (e._MagickImage_ColorFuzz_Get = e.asm.pe).apply(null, arguments);
    }, e._MagickImage_ColorFuzz_Set = function() {
      return (e._MagickImage_ColorFuzz_Set = e.asm.qe).apply(null, arguments);
    }, e._MagickImage_ColormapSize_Get = function() {
      return (e._MagickImage_ColormapSize_Get = e.asm.re).apply(null, arguments);
    }, e._MagickImage_ColormapSize_Set = function() {
      return (e._MagickImage_ColormapSize_Set = e.asm.se).apply(null, arguments);
    }, e._MagickImage_ColorSpace_Get = function() {
      return (e._MagickImage_ColorSpace_Get = e.asm.te).apply(null, arguments);
    }, e._MagickImage_ColorSpace_Set = function() {
      return (e._MagickImage_ColorSpace_Set = e.asm.ue).apply(null, arguments);
    }, e._MagickImage_ColorType_Get = function() {
      return (e._MagickImage_ColorType_Get = e.asm.ve).apply(null, arguments);
    }, e._MagickImage_ColorType_Set = function() {
      return (e._MagickImage_ColorType_Set = e.asm.we).apply(null, arguments);
    }, e._MagickImage_Compose_Get = function() {
      return (e._MagickImage_Compose_Get = e.asm.xe).apply(null, arguments);
    }, e._MagickImage_Compose_Set = function() {
      return (e._MagickImage_Compose_Set = e.asm.ye).apply(null, arguments);
    }, e._MagickImage_Compression_Get = function() {
      return (e._MagickImage_Compression_Get = e.asm.ze).apply(null, arguments);
    }, e._MagickImage_Compression_Set = function() {
      return (e._MagickImage_Compression_Set = e.asm.Ae).apply(null, arguments);
    }, e._MagickImage_Depth_Get = function() {
      return (e._MagickImage_Depth_Get = e.asm.Be).apply(null, arguments);
    }, e._MagickImage_Depth_Set = function() {
      return (e._MagickImage_Depth_Set = e.asm.Ce).apply(null, arguments);
    }, e._MagickImage_EncodingGeometry_Get = function() {
      return (e._MagickImage_EncodingGeometry_Get = e.asm.De).apply(null, arguments);
    }, e._MagickImage_Endian_Get = function() {
      return (e._MagickImage_Endian_Get = e.asm.Ee).apply(null, arguments);
    }, e._MagickImage_Endian_Set = function() {
      return (e._MagickImage_Endian_Set = e.asm.Fe).apply(null, arguments);
    }, e._MagickImage_FileName_Get = function() {
      return (e._MagickImage_FileName_Get = e.asm.Ge).apply(null, arguments);
    }, e._MagickImage_FileName_Set = function() {
      return (e._MagickImage_FileName_Set = e.asm.He).apply(null, arguments);
    }, e._MagickImage_FilterType_Get = function() {
      return (e._MagickImage_FilterType_Get = e.asm.Ie).apply(null, arguments);
    }, e._MagickImage_FilterType_Set = function() {
      return (e._MagickImage_FilterType_Set = e.asm.Je).apply(null, arguments);
    }, e._MagickImage_Format_Get = function() {
      return (e._MagickImage_Format_Get = e.asm.Ke).apply(null, arguments);
    }, e._MagickImage_Format_Set = function() {
      return (e._MagickImage_Format_Set = e.asm.Le).apply(null, arguments);
    }, e._MagickImage_Gamma_Get = function() {
      return (e._MagickImage_Gamma_Get = e.asm.Me).apply(null, arguments);
    }, e._MagickImage_GifDisposeMethod_Get = function() {
      return (e._MagickImage_GifDisposeMethod_Get = e.asm.Ne).apply(null, arguments);
    }, e._MagickImage_GifDisposeMethod_Set = function() {
      return (e._MagickImage_GifDisposeMethod_Set = e.asm.Oe).apply(null, arguments);
    }, e._MagickImage_HasAlpha_Get = function() {
      return (e._MagickImage_HasAlpha_Get = e.asm.Pe).apply(null, arguments);
    }, e._MagickImage_HasAlpha_Set = function() {
      return (e._MagickImage_HasAlpha_Set = e.asm.Qe).apply(null, arguments);
    }, e._MagickImage_Height_Get = function() {
      return (e._MagickImage_Height_Get = e.asm.Re).apply(null, arguments);
    }, e._MagickImage_Interlace_Get = function() {
      return (e._MagickImage_Interlace_Get = e.asm.Se).apply(null, arguments);
    }, e._MagickImage_Interlace_Set = function() {
      return (e._MagickImage_Interlace_Set = e.asm.Te).apply(null, arguments);
    }, e._MagickImage_Interpolate_Get = function() {
      return (e._MagickImage_Interpolate_Get = e.asm.Ue).apply(null, arguments);
    }, e._MagickImage_Interpolate_Set = function() {
      return (e._MagickImage_Interpolate_Set = e.asm.Ve).apply(null, arguments);
    }, e._MagickImage_IsOpaque_Get = function() {
      return (e._MagickImage_IsOpaque_Get = e.asm.We).apply(null, arguments);
    }, e._MagickImage_MatteColor_Get = function() {
      return (e._MagickImage_MatteColor_Get = e.asm.Xe).apply(null, arguments);
    }, e._MagickImage_MatteColor_Set = function() {
      return (e._MagickImage_MatteColor_Set = e.asm.Ye).apply(null, arguments);
    }, e._MagickImage_MeanErrorPerPixel_Get = function() {
      return (e._MagickImage_MeanErrorPerPixel_Get = e.asm.Ze).apply(null, arguments);
    }, e._MagickImage_MetaChannelCount_Get = function() {
      return (e._MagickImage_MetaChannelCount_Get = e.asm._e).apply(null, arguments);
    }, e._MagickImage_MetaChannelCount_Set = function() {
      return (e._MagickImage_MetaChannelCount_Set = e.asm.$e).apply(null, arguments);
    }, e._MagickImage_NormalizedMaximumError_Get = function() {
      return (e._MagickImage_NormalizedMaximumError_Get = e.asm.af).apply(null, arguments);
    }, e._MagickImage_NormalizedMeanError_Get = function() {
      return (e._MagickImage_NormalizedMeanError_Get = e.asm.bf).apply(null, arguments);
    }, e._MagickImage_Orientation_Get = function() {
      return (e._MagickImage_Orientation_Get = e.asm.cf).apply(null, arguments);
    }, e._MagickImage_Orientation_Set = function() {
      return (e._MagickImage_Orientation_Set = e.asm.df).apply(null, arguments);
    }, e._MagickImage_Page_Get = function() {
      return (e._MagickImage_Page_Get = e.asm.ef).apply(null, arguments);
    }, e._MagickImage_Page_Set = function() {
      return (e._MagickImage_Page_Set = e.asm.ff).apply(null, arguments);
    }, e._MagickImage_Quality_Get = function() {
      return (e._MagickImage_Quality_Get = e.asm.gf).apply(null, arguments);
    }, e._MagickImage_Quality_Set = function() {
      return (e._MagickImage_Quality_Set = e.asm.hf).apply(null, arguments);
    }, e._MagickImage_RenderingIntent_Get = function() {
      return (e._MagickImage_RenderingIntent_Get = e.asm.jf).apply(null, arguments);
    }, e._MagickImage_RenderingIntent_Set = function() {
      return (e._MagickImage_RenderingIntent_Set = e.asm.kf).apply(null, arguments);
    }, e._MagickImage_ResolutionUnits_Get = function() {
      return (e._MagickImage_ResolutionUnits_Get = e.asm.lf).apply(null, arguments);
    }, e._MagickImage_ResolutionUnits_Set = function() {
      return (e._MagickImage_ResolutionUnits_Set = e.asm.mf).apply(null, arguments);
    }, e._MagickImage_ResolutionX_Get = function() {
      return (e._MagickImage_ResolutionX_Get = e.asm.nf).apply(null, arguments);
    }, e._MagickImage_ResolutionX_Set = function() {
      return (e._MagickImage_ResolutionX_Set = e.asm.of).apply(null, arguments);
    }, e._MagickImage_ResolutionY_Get = function() {
      return (e._MagickImage_ResolutionY_Get = e.asm.pf).apply(null, arguments);
    }, e._MagickImage_ResolutionY_Set = function() {
      return (e._MagickImage_ResolutionY_Set = e.asm.qf).apply(null, arguments);
    }, e._MagickImage_Signature_Get = function() {
      return (e._MagickImage_Signature_Get = e.asm.rf).apply(null, arguments);
    }, e._MagickImage_TotalColors_Get = function() {
      return (e._MagickImage_TotalColors_Get = e.asm.sf).apply(null, arguments);
    }, e._MagickImage_VirtualPixelMethod_Get = function() {
      return (e._MagickImage_VirtualPixelMethod_Get = e.asm.tf).apply(null, arguments);
    }, e._MagickImage_VirtualPixelMethod_Set = function() {
      return (e._MagickImage_VirtualPixelMethod_Set = e.asm.uf).apply(null, arguments);
    }, e._MagickImage_Width_Get = function() {
      return (e._MagickImage_Width_Get = e.asm.vf).apply(null, arguments);
    }, e._MagickImage_AdaptiveBlur = function() {
      return (e._MagickImage_AdaptiveBlur = e.asm.wf).apply(null, arguments);
    }, e._MagickImage_AdaptiveResize = function() {
      return (e._MagickImage_AdaptiveResize = e.asm.xf).apply(null, arguments);
    }, e._MagickImage_AdaptiveSharpen = function() {
      return (e._MagickImage_AdaptiveSharpen = e.asm.yf).apply(null, arguments);
    }, e._MagickImage_AdaptiveThreshold = function() {
      return (e._MagickImage_AdaptiveThreshold = e.asm.zf).apply(null, arguments);
    }, e._MagickImage_AddNoise = function() {
      return (e._MagickImage_AddNoise = e.asm.Af).apply(null, arguments);
    }, e._MagickImage_AffineTransform = function() {
      return (e._MagickImage_AffineTransform = e.asm.Bf).apply(null, arguments);
    }, e._MagickImage_Annotate = function() {
      return (e._MagickImage_Annotate = e.asm.Cf).apply(null, arguments);
    }, e._MagickImage_AnnotateGravity = function() {
      return (e._MagickImage_AnnotateGravity = e.asm.Df).apply(null, arguments);
    }, e._MagickImage_AutoGamma = function() {
      return (e._MagickImage_AutoGamma = e.asm.Ef).apply(null, arguments);
    }, e._MagickImage_AutoLevel = function() {
      return (e._MagickImage_AutoLevel = e.asm.Ff).apply(null, arguments);
    }, e._MagickImage_AutoOrient = function() {
      return (e._MagickImage_AutoOrient = e.asm.Gf).apply(null, arguments);
    }, e._MagickImage_AutoThreshold = function() {
      return (e._MagickImage_AutoThreshold = e.asm.Hf).apply(null, arguments);
    }, e._MagickImage_BilateralBlur = function() {
      return (e._MagickImage_BilateralBlur = e.asm.If).apply(null, arguments);
    }, e._MagickImage_BlackThreshold = function() {
      return (e._MagickImage_BlackThreshold = e.asm.Jf).apply(null, arguments);
    }, e._MagickImage_BlueShift = function() {
      return (e._MagickImage_BlueShift = e.asm.Kf).apply(null, arguments);
    }, e._MagickImage_Blur = function() {
      return (e._MagickImage_Blur = e.asm.Lf).apply(null, arguments);
    }, e._MagickImage_Border = function() {
      return (e._MagickImage_Border = e.asm.Mf).apply(null, arguments);
    }, e._MagickImage_BrightnessContrast = function() {
      return (e._MagickImage_BrightnessContrast = e.asm.Nf).apply(null, arguments);
    }, e._MagickImage_CannyEdge = function() {
      return (e._MagickImage_CannyEdge = e.asm.Of).apply(null, arguments);
    }, e._MagickImage_ChannelOffset = function() {
      return (e._MagickImage_ChannelOffset = e.asm.Pf).apply(null, arguments);
    }, e._MagickImage_Charcoal = function() {
      return (e._MagickImage_Charcoal = e.asm.Qf).apply(null, arguments);
    }, e._MagickImage_Chop = function() {
      return (e._MagickImage_Chop = e.asm.Rf).apply(null, arguments);
    }, e._MagickImage_Clahe = function() {
      return (e._MagickImage_Clahe = e.asm.Sf).apply(null, arguments);
    }, e._MagickImage_Clamp = function() {
      return (e._MagickImage_Clamp = e.asm.Tf).apply(null, arguments);
    }, e._MagickImage_ClipPath = function() {
      return (e._MagickImage_ClipPath = e.asm.Uf).apply(null, arguments);
    }, e._MagickImage_Clone = function() {
      return (e._MagickImage_Clone = e.asm.Vf).apply(null, arguments);
    }, e._MagickImage_CloneArea = function() {
      return (e._MagickImage_CloneArea = e.asm.Wf).apply(null, arguments);
    }, e._MagickImage_Clut = function() {
      return (e._MagickImage_Clut = e.asm.Xf).apply(null, arguments);
    }, e._MagickImage_ColorDecisionList = function() {
      return (e._MagickImage_ColorDecisionList = e.asm.Yf).apply(null, arguments);
    }, e._MagickImage_Colorize = function() {
      return (e._MagickImage_Colorize = e.asm.Zf).apply(null, arguments);
    }, e._MagickImage_ColorMatrix = function() {
      return (e._MagickImage_ColorMatrix = e.asm._f).apply(null, arguments);
    }, e._MagickImage_ColorThreshold = function() {
      return (e._MagickImage_ColorThreshold = e.asm.$f).apply(null, arguments);
    }, e._MagickImage_Compare = function() {
      return (e._MagickImage_Compare = e.asm.ag).apply(null, arguments);
    }, e._MagickImage_CompareDistortion = function() {
      return (e._MagickImage_CompareDistortion = e.asm.bg).apply(null, arguments);
    }, e._MagickImage_Composite = function() {
      return (e._MagickImage_Composite = e.asm.cg).apply(null, arguments);
    }, e._MagickImage_CompositeGravity = function() {
      return (e._MagickImage_CompositeGravity = e.asm.dg).apply(null, arguments);
    }, e._MagickImage_ConnectedComponents = function() {
      return (e._MagickImage_ConnectedComponents = e.asm.eg).apply(null, arguments);
    }, e._MagickImage_Contrast = function() {
      return (e._MagickImage_Contrast = e.asm.fg).apply(null, arguments);
    }, e._MagickImage_ContrastStretch = function() {
      return (e._MagickImage_ContrastStretch = e.asm.gg).apply(null, arguments);
    }, e._MagickImage_ConvexHull = function() {
      return (e._MagickImage_ConvexHull = e.asm.hg).apply(null, arguments);
    }, e._MagickImage_Convolve = function() {
      return (e._MagickImage_Convolve = e.asm.ig).apply(null, arguments);
    }, e._MagickImage_CopyPixels = function() {
      return (e._MagickImage_CopyPixels = e.asm.jg).apply(null, arguments);
    }, e._MagickImage_Crop = function() {
      return (e._MagickImage_Crop = e.asm.kg).apply(null, arguments);
    }, e._MagickImage_CropToTiles = function() {
      return (e._MagickImage_CropToTiles = e.asm.lg).apply(null, arguments);
    }, e._MagickImage_CycleColormap = function() {
      return (e._MagickImage_CycleColormap = e.asm.mg).apply(null, arguments);
    }, e._MagickImage_Decipher = function() {
      return (e._MagickImage_Decipher = e.asm.ng).apply(null, arguments);
    }, e._MagickImage_Deskew = function() {
      return (e._MagickImage_Deskew = e.asm.og).apply(null, arguments);
    }, e._MagickImage_Despeckle = function() {
      return (e._MagickImage_Despeckle = e.asm.pg).apply(null, arguments);
    }, e._MagickImage_DetermineBitDepth = function() {
      return (e._MagickImage_DetermineBitDepth = e.asm.qg).apply(null, arguments);
    }, e._MagickImage_DetermineColorType = function() {
      return (e._MagickImage_DetermineColorType = e.asm.rg).apply(null, arguments);
    }, e._MagickImage_Distort = function() {
      return (e._MagickImage_Distort = e.asm.sg).apply(null, arguments);
    }, e._MagickImage_Edge = function() {
      return (e._MagickImage_Edge = e.asm.tg).apply(null, arguments);
    }, e._MagickImage_Emboss = function() {
      return (e._MagickImage_Emboss = e.asm.ug).apply(null, arguments);
    }, e._MagickImage_Encipher = function() {
      return (e._MagickImage_Encipher = e.asm.vg).apply(null, arguments);
    }, e._MagickImage_Enhance = function() {
      return (e._MagickImage_Enhance = e.asm.wg).apply(null, arguments);
    }, e._MagickImage_Equalize = function() {
      return (e._MagickImage_Equalize = e.asm.xg).apply(null, arguments);
    }, e._MagickImage_Equals = function() {
      return (e._MagickImage_Equals = e.asm.yg).apply(null, arguments);
    }, e._MagickImage_EvaluateFunction = function() {
      return (e._MagickImage_EvaluateFunction = e.asm.zg).apply(null, arguments);
    }, e._MagickImage_EvaluateGeometry = function() {
      return (e._MagickImage_EvaluateGeometry = e.asm.Ag).apply(null, arguments);
    }, e._MagickImage_EvaluateOperator = function() {
      return (e._MagickImage_EvaluateOperator = e.asm.Bg).apply(null, arguments);
    }, e._MagickImage_Extent = function() {
      return (e._MagickImage_Extent = e.asm.Cg).apply(null, arguments);
    }, e._MagickImage_Flip = function() {
      return (e._MagickImage_Flip = e.asm.Dg).apply(null, arguments);
    }, e._MagickImage_FloodFill = function() {
      return (e._MagickImage_FloodFill = e.asm.Eg).apply(null, arguments);
    }, e._MagickImage_Flop = function() {
      return (e._MagickImage_Flop = e.asm.Fg).apply(null, arguments);
    }, e._MagickImage_FontTypeMetrics = function() {
      return (e._MagickImage_FontTypeMetrics = e.asm.Gg).apply(null, arguments);
    }, e._MagickImage_FormatExpression = function() {
      return (e._MagickImage_FormatExpression = e.asm.Hg).apply(null, arguments);
    }, e._MagickImage_Frame = function() {
      return (e._MagickImage_Frame = e.asm.Ig).apply(null, arguments);
    }, e._MagickImage_Fx = function() {
      return (e._MagickImage_Fx = e.asm.Jg).apply(null, arguments);
    }, e._MagickImage_GammaCorrect = function() {
      return (e._MagickImage_GammaCorrect = e.asm.Kg).apply(null, arguments);
    }, e._MagickImage_GaussianBlur = function() {
      return (e._MagickImage_GaussianBlur = e.asm.Lg).apply(null, arguments);
    }, e._MagickImage_GetArtifact = function() {
      return (e._MagickImage_GetArtifact = e.asm.Mg).apply(null, arguments);
    }, e._MagickImage_GetAttribute = function() {
      return (e._MagickImage_GetAttribute = e.asm.Ng).apply(null, arguments);
    }, e._MagickImage_GetColormapColor = function() {
      return (e._MagickImage_GetColormapColor = e.asm.Og).apply(null, arguments);
    }, e._MagickImage_GetNext = function() {
      return (e._MagickImage_GetNext = e.asm.Pg).apply(null, arguments);
    }, e._MagickImage_GetNextArtifactName = function() {
      return (e._MagickImage_GetNextArtifactName = e.asm.Qg).apply(null, arguments);
    }, e._MagickImage_GetNextAttributeName = function() {
      return (e._MagickImage_GetNextAttributeName = e.asm.Rg).apply(null, arguments);
    }, e._MagickImage_GetNextProfileName = function() {
      return (e._MagickImage_GetNextProfileName = e.asm.Sg).apply(null, arguments);
    }, e._MagickImage_GetProfile = function() {
      return (e._MagickImage_GetProfile = e.asm.Tg).apply(null, arguments);
    }, e._MagickImage_GetReadMask = function() {
      return (e._MagickImage_GetReadMask = e.asm.Ug).apply(null, arguments);
    }, e._MagickImage_GetWriteMask = function() {
      return (e._MagickImage_GetWriteMask = e.asm.Vg).apply(null, arguments);
    }, e._MagickImage_Grayscale = function() {
      return (e._MagickImage_Grayscale = e.asm.Wg).apply(null, arguments);
    }, e._MagickImage_HaldClut = function() {
      return (e._MagickImage_HaldClut = e.asm.Xg).apply(null, arguments);
    }, e._MagickImage_HasChannel = function() {
      return (e._MagickImage_HasChannel = e.asm.Yg).apply(null, arguments);
    }, e._MagickImage_HasProfile = function() {
      return (e._MagickImage_HasProfile = e.asm.Zg).apply(null, arguments);
    }, e._MagickImage_Histogram = function() {
      return (e._MagickImage_Histogram = e.asm._g).apply(null, arguments);
    }, e._MagickImage_HoughLine = function() {
      return (e._MagickImage_HoughLine = e.asm.$g).apply(null, arguments);
    }, e._MagickImage_Implode = function() {
      return (e._MagickImage_Implode = e.asm.ah).apply(null, arguments);
    }, e._MagickImage_ImportPixels = function() {
      return (e._MagickImage_ImportPixels = e.asm.bh).apply(null, arguments);
    }, e._MagickImage_Integral = function() {
      return (e._MagickImage_Integral = e.asm.ch).apply(null, arguments);
    }, e._MagickImage_InterpolativeResize = function() {
      return (e._MagickImage_InterpolativeResize = e.asm.dh).apply(null, arguments);
    }, e._MagickImage_InverseLevel = function() {
      return (e._MagickImage_InverseLevel = e.asm.eh).apply(null, arguments);
    }, e._MagickImage_Kmeans = function() {
      return (e._MagickImage_Kmeans = e.asm.fh).apply(null, arguments);
    }, e._MagickImage_Kuwahara = function() {
      return (e._MagickImage_Kuwahara = e.asm.gh).apply(null, arguments);
    }, e._MagickImage_Level = function() {
      return (e._MagickImage_Level = e.asm.hh).apply(null, arguments);
    }, e._MagickImage_LevelColors = function() {
      return (e._MagickImage_LevelColors = e.asm.ih).apply(null, arguments);
    }, e._MagickImage_LinearStretch = function() {
      return (e._MagickImage_LinearStretch = e.asm.jh).apply(null, arguments);
    }, e._MagickImage_LiquidRescale = function() {
      return (e._MagickImage_LiquidRescale = e.asm.kh).apply(null, arguments);
    }, e._MagickImage_LocalContrast = function() {
      return (e._MagickImage_LocalContrast = e.asm.lh).apply(null, arguments);
    }, e._MagickImage_Magnify = function() {
      return (e._MagickImage_Magnify = e.asm.mh).apply(null, arguments);
    }, e._MagickImage_Map = function() {
      return (e._MagickImage_Map = e.asm.nh).apply(null, arguments);
    }, e._MagickImage_MeanShift = function() {
      return (e._MagickImage_MeanShift = e.asm.oh).apply(null, arguments);
    }, e._MagickImage_Minify = function() {
      return (e._MagickImage_Minify = e.asm.ph).apply(null, arguments);
    }, e._MagickImage_MinimumBoundingBox = function() {
      return (e._MagickImage_MinimumBoundingBox = e.asm.qh).apply(null, arguments);
    }, e._MagickImage_Modulate = function() {
      return (e._MagickImage_Modulate = e.asm.rh).apply(null, arguments);
    }, e._MagickImage_Moments = function() {
      return (e._MagickImage_Moments = e.asm.sh).apply(null, arguments);
    }, e._MagickImage_Morphology = function() {
      return (e._MagickImage_Morphology = e.asm.th).apply(null, arguments);
    }, e._MagickImage_MotionBlur = function() {
      return (e._MagickImage_MotionBlur = e.asm.uh).apply(null, arguments);
    }, e._MagickImage_Negate = function() {
      return (e._MagickImage_Negate = e.asm.vh).apply(null, arguments);
    }, e._MagickImage_Normalize = function() {
      return (e._MagickImage_Normalize = e.asm.wh).apply(null, arguments);
    }, e._MagickImage_OilPaint = function() {
      return (e._MagickImage_OilPaint = e.asm.xh).apply(null, arguments);
    }, e._MagickImage_Opaque = function() {
      return (e._MagickImage_Opaque = e.asm.yh).apply(null, arguments);
    }, e._MagickImage_OrderedDither = function() {
      return (e._MagickImage_OrderedDither = e.asm.zh).apply(null, arguments);
    }, e._MagickImage_Perceptible = function() {
      return (e._MagickImage_Perceptible = e.asm.Ah).apply(null, arguments);
    }, e._MagickImage_PerceptualHash = function() {
      return (e._MagickImage_PerceptualHash = e.asm.Bh).apply(null, arguments);
    }, e._MagickImage_Quantize = function() {
      return (e._MagickImage_Quantize = e.asm.Ch).apply(null, arguments);
    }, e._MagickImage_Polaroid = function() {
      return (e._MagickImage_Polaroid = e.asm.Dh).apply(null, arguments);
    }, e._MagickImage_Posterize = function() {
      return (e._MagickImage_Posterize = e.asm.Eh).apply(null, arguments);
    }, e._MagickImage_RaiseOrLower = function() {
      return (e._MagickImage_RaiseOrLower = e.asm.Fh).apply(null, arguments);
    }, e._MagickImage_RandomThreshold = function() {
      return (e._MagickImage_RandomThreshold = e.asm.Gh).apply(null, arguments);
    }, e._MagickImage_RangeThreshold = function() {
      return (e._MagickImage_RangeThreshold = e.asm.Hh).apply(null, arguments);
    }, e._MagickImage_ReadBlob = function() {
      return (e._MagickImage_ReadBlob = e.asm.Ih).apply(null, arguments);
    }, e._MagickImage_ReadFile = function() {
      return (e._MagickImage_ReadFile = e.asm.Jh).apply(null, arguments);
    }, e._MagickImage_ReadPixels = function() {
      return (e._MagickImage_ReadPixels = e.asm.Kh).apply(null, arguments);
    }, e._MagickImage_ReadStream = function() {
      return (e._MagickImage_ReadStream = e.asm.Lh).apply(null, arguments);
    }, e._MagickImage_RegionMask = function() {
      return (e._MagickImage_RegionMask = e.asm.Mh).apply(null, arguments);
    }, e._MagickImage_RemoveArtifact = function() {
      return (e._MagickImage_RemoveArtifact = e.asm.Nh).apply(null, arguments);
    }, e._MagickImage_RemoveAttribute = function() {
      return (e._MagickImage_RemoveAttribute = e.asm.Oh).apply(null, arguments);
    }, e._MagickImage_RemoveProfile = function() {
      return (e._MagickImage_RemoveProfile = e.asm.Ph).apply(null, arguments);
    }, e._MagickImage_ResetArtifactIterator = function() {
      return (e._MagickImage_ResetArtifactIterator = e.asm.Qh).apply(null, arguments);
    }, e._MagickImage_ResetAttributeIterator = function() {
      return (e._MagickImage_ResetAttributeIterator = e.asm.Rh).apply(null, arguments);
    }, e._MagickImage_ResetProfileIterator = function() {
      return (e._MagickImage_ResetProfileIterator = e.asm.Sh).apply(null, arguments);
    }, e._MagickImage_Resample = function() {
      return (e._MagickImage_Resample = e.asm.Th).apply(null, arguments);
    }, e._MagickImage_Resize = function() {
      return (e._MagickImage_Resize = e.asm.Uh).apply(null, arguments);
    }, e._MagickImage_Roll = function() {
      return (e._MagickImage_Roll = e.asm.Vh).apply(null, arguments);
    }, e._MagickImage_Rotate = function() {
      return (e._MagickImage_Rotate = e.asm.Wh).apply(null, arguments);
    }, e._MagickImage_RotationalBlur = function() {
      return (e._MagickImage_RotationalBlur = e.asm.Xh).apply(null, arguments);
    }, e._MagickImage_Sample = function() {
      return (e._MagickImage_Sample = e.asm.Yh).apply(null, arguments);
    }, e._MagickImage_Scale = function() {
      return (e._MagickImage_Scale = e.asm.Zh).apply(null, arguments);
    }, e._MagickImage_Segment = function() {
      return (e._MagickImage_Segment = e.asm._h).apply(null, arguments);
    }, e._MagickImage_SelectiveBlur = function() {
      return (e._MagickImage_SelectiveBlur = e.asm.$h).apply(null, arguments);
    }, e._MagickImage_Separate = function() {
      return (e._MagickImage_Separate = e.asm.ai).apply(null, arguments);
    }, e._MagickImage_SepiaTone = function() {
      return (e._MagickImage_SepiaTone = e.asm.bi).apply(null, arguments);
    }, e._MagickImage_SetAlpha = function() {
      return (e._MagickImage_SetAlpha = e.asm.ci).apply(null, arguments);
    }, e._MagickImage_SetArtifact = function() {
      return (e._MagickImage_SetArtifact = e.asm.di).apply(null, arguments);
    }, e._MagickImage_SetAttribute = function() {
      return (e._MagickImage_SetAttribute = e.asm.ei).apply(null, arguments);
    }, e._MagickImage_SetBitDepth = function() {
      return (e._MagickImage_SetBitDepth = e.asm.fi).apply(null, arguments);
    }, e._MagickImage_SetClientData = function() {
      return (e._MagickImage_SetClientData = e.asm.gi).apply(null, arguments);
    }, e._MagickImage_SetColormapColor = function() {
      return (e._MagickImage_SetColormapColor = e.asm.hi).apply(null, arguments);
    }, e._MagickImage_SetColorMetric = function() {
      return (e._MagickImage_SetColorMetric = e.asm.ii).apply(null, arguments);
    }, e._MagickImage_SetNext = function() {
      return (e._MagickImage_SetNext = e.asm.ji).apply(null, arguments);
    }, e._MagickImage_SetProfile = function() {
      return (e._MagickImage_SetProfile = e.asm.ki).apply(null, arguments);
    }, e._MagickImage_SetProgressDelegate = function() {
      return (e._MagickImage_SetProgressDelegate = e.asm.li).apply(null, arguments);
    }, e._MagickImage_SetReadMask = function() {
      return (e._MagickImage_SetReadMask = e.asm.mi).apply(null, arguments);
    }, e._MagickImage_SetWriteMask = function() {
      return (e._MagickImage_SetWriteMask = e.asm.ni).apply(null, arguments);
    }, e._MagickImage_Shade = function() {
      return (e._MagickImage_Shade = e.asm.oi).apply(null, arguments);
    }, e._MagickImage_Shadow = function() {
      return (e._MagickImage_Shadow = e.asm.pi).apply(null, arguments);
    }, e._MagickImage_Sharpen = function() {
      return (e._MagickImage_Sharpen = e.asm.qi).apply(null, arguments);
    }, e._MagickImage_Shave = function() {
      return (e._MagickImage_Shave = e.asm.ri).apply(null, arguments);
    }, e._MagickImage_Shear = function() {
      return (e._MagickImage_Shear = e.asm.si).apply(null, arguments);
    }, e._MagickImage_SigmoidalContrast = function() {
      return (e._MagickImage_SigmoidalContrast = e.asm.ti).apply(null, arguments);
    }, e._MagickImage_SparseColor = function() {
      return (e._MagickImage_SparseColor = e.asm.ui).apply(null, arguments);
    }, e._MagickImage_Spread = function() {
      return (e._MagickImage_Spread = e.asm.vi).apply(null, arguments);
    }, e._MagickImage_Sketch = function() {
      return (e._MagickImage_Sketch = e.asm.wi).apply(null, arguments);
    }, e._MagickImage_Solarize = function() {
      return (e._MagickImage_Solarize = e.asm.xi).apply(null, arguments);
    }, e._MagickImage_SortPixels = function() {
      return (e._MagickImage_SortPixels = e.asm.yi).apply(null, arguments);
    }, e._MagickImage_Splice = function() {
      return (e._MagickImage_Splice = e.asm.zi).apply(null, arguments);
    }, e._MagickImage_Statistic = function() {
      return (e._MagickImage_Statistic = e.asm.Ai).apply(null, arguments);
    }, e._MagickImage_Statistics = function() {
      return (e._MagickImage_Statistics = e.asm.Bi).apply(null, arguments);
    }, e._MagickImage_Stegano = function() {
      return (e._MagickImage_Stegano = e.asm.Ci).apply(null, arguments);
    }, e._MagickImage_Stereo = function() {
      return (e._MagickImage_Stereo = e.asm.Di).apply(null, arguments);
    }, e._MagickImage_Strip = function() {
      return (e._MagickImage_Strip = e.asm.Ei).apply(null, arguments);
    }, e._MagickImage_SubImageSearch = function() {
      return (e._MagickImage_SubImageSearch = e.asm.Fi).apply(null, arguments);
    }, e._MagickImage_Swirl = function() {
      return (e._MagickImage_Swirl = e.asm.Gi).apply(null, arguments);
    }, e._MagickImage_Texture = function() {
      return (e._MagickImage_Texture = e.asm.Hi).apply(null, arguments);
    }, e._MagickImage_Threshold = function() {
      return (e._MagickImage_Threshold = e.asm.Ii).apply(null, arguments);
    }, e._MagickImage_Thumbnail = function() {
      return (e._MagickImage_Thumbnail = e.asm.Ji).apply(null, arguments);
    }, e._MagickImage_Tint = function() {
      return (e._MagickImage_Tint = e.asm.Ki).apply(null, arguments);
    }, e._MagickImage_Transparent = function() {
      return (e._MagickImage_Transparent = e.asm.Li).apply(null, arguments);
    }, e._MagickImage_TransparentChroma = function() {
      return (e._MagickImage_TransparentChroma = e.asm.Mi).apply(null, arguments);
    }, e._MagickImage_Transpose = function() {
      return (e._MagickImage_Transpose = e.asm.Ni).apply(null, arguments);
    }, e._MagickImage_Transverse = function() {
      return (e._MagickImage_Transverse = e.asm.Oi).apply(null, arguments);
    }, e._MagickImage_Trim = function() {
      return (e._MagickImage_Trim = e.asm.Pi).apply(null, arguments);
    }, e._MagickImage_UniqueColors = function() {
      return (e._MagickImage_UniqueColors = e.asm.Qi).apply(null, arguments);
    }, e._MagickImage_UnsharpMask = function() {
      return (e._MagickImage_UnsharpMask = e.asm.Ri).apply(null, arguments);
    }, e._MagickImage_Vignette = function() {
      return (e._MagickImage_Vignette = e.asm.Si).apply(null, arguments);
    }, e._MagickImage_Wave = function() {
      return (e._MagickImage_Wave = e.asm.Ti).apply(null, arguments);
    }, e._MagickImage_WaveletDenoise = function() {
      return (e._MagickImage_WaveletDenoise = e.asm.Ui).apply(null, arguments);
    }, e._MagickImage_WhiteBalance = function() {
      return (e._MagickImage_WhiteBalance = e.asm.Vi).apply(null, arguments);
    }, e._MagickImage_WhiteThreshold = function() {
      return (e._MagickImage_WhiteThreshold = e.asm.Wi).apply(null, arguments);
    }, e._MagickImage_WriteBlob = function() {
      return (e._MagickImage_WriteBlob = e.asm.Xi).apply(null, arguments);
    }, e._MagickImage_WriteFile = function() {
      return (e._MagickImage_WriteFile = e.asm.Yi).apply(null, arguments);
    }, e._MagickImage_WriteStream = function() {
      return (e._MagickImage_WriteStream = e.asm.Zi).apply(null, arguments);
    }, e._MagickImageCollection_Append = function() {
      return (e._MagickImageCollection_Append = e.asm._i).apply(null, arguments);
    }, e._MagickImageCollection_Coalesce = function() {
      return (e._MagickImageCollection_Coalesce = e.asm.$i).apply(null, arguments);
    }, e._MagickImageCollection_Combine = function() {
      return (e._MagickImageCollection_Combine = e.asm.aj).apply(null, arguments);
    }, e._MagickImageCollection_Complex = function() {
      return (e._MagickImageCollection_Complex = e.asm.bj).apply(null, arguments);
    }, e._MagickImageCollection_Deconstruct = function() {
      return (e._MagickImageCollection_Deconstruct = e.asm.cj).apply(null, arguments);
    }, e._MagickImageCollection_Dispose = function() {
      return (e._MagickImageCollection_Dispose = e.asm.dj).apply(null, arguments);
    }, e._MagickImageCollection_Evaluate = function() {
      return (e._MagickImageCollection_Evaluate = e.asm.ej).apply(null, arguments);
    }, e._MagickImageCollection_Fx = function() {
      return (e._MagickImageCollection_Fx = e.asm.fj).apply(null, arguments);
    }, e._MagickImageCollection_Map = function() {
      return (e._MagickImageCollection_Map = e.asm.gj).apply(null, arguments);
    }, e._MagickImageCollection_Merge = function() {
      return (e._MagickImageCollection_Merge = e.asm.hj).apply(null, arguments);
    }, e._MagickImageCollection_Montage = function() {
      return (e._MagickImageCollection_Montage = e.asm.ij).apply(null, arguments);
    }, e._MagickImageCollection_Morph = function() {
      return (e._MagickImageCollection_Morph = e.asm.jj).apply(null, arguments);
    }, e._MagickImageCollection_Optimize = function() {
      return (e._MagickImageCollection_Optimize = e.asm.kj).apply(null, arguments);
    }, e._MagickImageCollection_OptimizePlus = function() {
      return (e._MagickImageCollection_OptimizePlus = e.asm.lj).apply(null, arguments);
    }, e._MagickImageCollection_OptimizeTransparency = function() {
      return (e._MagickImageCollection_OptimizeTransparency = e.asm.mj).apply(null, arguments);
    }, e._MagickImageCollection_Polynomial = function() {
      return (e._MagickImageCollection_Polynomial = e.asm.nj).apply(null, arguments);
    }, e._MagickImageCollection_Quantize = function() {
      return (e._MagickImageCollection_Quantize = e.asm.oj).apply(null, arguments);
    }, e._MagickImageCollection_ReadBlob = function() {
      return (e._MagickImageCollection_ReadBlob = e.asm.pj).apply(null, arguments);
    }, e._MagickImageCollection_ReadFile = function() {
      return (e._MagickImageCollection_ReadFile = e.asm.qj).apply(null, arguments);
    }, e._MagickImageCollection_ReadStream = function() {
      return (e._MagickImageCollection_ReadStream = e.asm.rj).apply(null, arguments);
    }, e._MagickImageCollection_Smush = function() {
      return (e._MagickImageCollection_Smush = e.asm.sj).apply(null, arguments);
    }, e._MagickImageCollection_WriteFile = function() {
      return (e._MagickImageCollection_WriteFile = e.asm.tj).apply(null, arguments);
    }, e._MagickImageCollection_WriteStream = function() {
      return (e._MagickImageCollection_WriteStream = e.asm.uj).apply(null, arguments);
    }, e._DoubleMatrix_Create = function() {
      return (e._DoubleMatrix_Create = e.asm.vj).apply(null, arguments);
    }, e._DoubleMatrix_Dispose = function() {
      return (e._DoubleMatrix_Dispose = e.asm.wj).apply(null, arguments);
    }, e._OpenCL_GetDevices = function() {
      return (e._OpenCL_GetDevices = e.asm.xj).apply(null, arguments);
    }, e._OpenCL_GetDevice = function() {
      return (e._OpenCL_GetDevice = e.asm.yj).apply(null, arguments);
    }, e._OpenCL_GetEnabled = function() {
      return (e._OpenCL_GetEnabled = e.asm.zj).apply(null, arguments);
    }, e._OpenCL_SetEnabled = function() {
      return (e._OpenCL_SetEnabled = e.asm.Aj).apply(null, arguments);
    }, e._OpenCLDevice_DeviceType_Get = function() {
      return (e._OpenCLDevice_DeviceType_Get = e.asm.Bj).apply(null, arguments);
    }, e._OpenCLDevice_BenchmarkScore_Get = function() {
      return (e._OpenCLDevice_BenchmarkScore_Get = e.asm.Cj).apply(null, arguments);
    }, e._OpenCLDevice_IsEnabled_Get = function() {
      return (e._OpenCLDevice_IsEnabled_Get = e.asm.Dj).apply(null, arguments);
    }, e._OpenCLDevice_IsEnabled_Set = function() {
      return (e._OpenCLDevice_IsEnabled_Set = e.asm.Ej).apply(null, arguments);
    }, e._OpenCLDevice_Name_Get = function() {
      return (e._OpenCLDevice_Name_Get = e.asm.Fj).apply(null, arguments);
    }, e._OpenCLDevice_Version_Get = function() {
      return (e._OpenCLDevice_Version_Get = e.asm.Gj).apply(null, arguments);
    }, e._OpenCLDevice_GetKernelProfileRecords = function() {
      return (e._OpenCLDevice_GetKernelProfileRecords = e.asm.Hj).apply(null, arguments);
    }, e._OpenCLDevice_GetKernelProfileRecord = function() {
      return (e._OpenCLDevice_GetKernelProfileRecord = e.asm.Ij).apply(null, arguments);
    }, e._OpenCLDevice_SetProfileKernels = function() {
      return (e._OpenCLDevice_SetProfileKernels = e.asm.Jj).apply(null, arguments);
    }, e._OpenCLKernelProfileRecord_Count_Get = function() {
      return (e._OpenCLKernelProfileRecord_Count_Get = e.asm.Kj).apply(null, arguments);
    }, e._OpenCLKernelProfileRecord_Name_Get = function() {
      return (e._OpenCLKernelProfileRecord_Name_Get = e.asm.Lj).apply(null, arguments);
    }, e._OpenCLKernelProfileRecord_MaximumDuration_Get = function() {
      return (e._OpenCLKernelProfileRecord_MaximumDuration_Get = e.asm.Mj).apply(null, arguments);
    }, e._OpenCLKernelProfileRecord_MinimumDuration_Get = function() {
      return (e._OpenCLKernelProfileRecord_MinimumDuration_Get = e.asm.Nj).apply(null, arguments);
    }, e._OpenCLKernelProfileRecord_TotalDuration_Get = function() {
      return (e._OpenCLKernelProfileRecord_TotalDuration_Get = e.asm.Oj).apply(null, arguments);
    }, e._JpegOptimizer_CompressFile = function() {
      return (e._JpegOptimizer_CompressFile = e.asm.Pj).apply(null, arguments);
    }, e._JpegOptimizer_CompressStream = function() {
      return (e._JpegOptimizer_CompressStream = e.asm.Qj).apply(null, arguments);
    };
    var Et = e._malloc = function() {
      return (Et = e._malloc = e.asm.Rj).apply(null, arguments);
    }, Se = e._free = function() {
      return (Se = e._free = e.asm.Sj).apply(null, arguments);
    }, gt = function() {
      return (gt = e.asm.Tj).apply(null, arguments);
    };
    e._PixelCollection_Create = function() {
      return (e._PixelCollection_Create = e.asm.Uj).apply(null, arguments);
    }, e._PixelCollection_Dispose = function() {
      return (e._PixelCollection_Dispose = e.asm.Vj).apply(null, arguments);
    }, e._PixelCollection_GetArea = function() {
      return (e._PixelCollection_GetArea = e.asm.Wj).apply(null, arguments);
    }, e._PixelCollection_GetReadOnlyArea = function() {
      return (e._PixelCollection_GetReadOnlyArea = e.asm.Xj).apply(null, arguments);
    }, e._PixelCollection_SetArea = function() {
      return (e._PixelCollection_SetArea = e.asm.Yj).apply(null, arguments);
    }, e._PixelCollection_ToByteArray = function() {
      return (e._PixelCollection_ToByteArray = e.asm.Zj).apply(null, arguments);
    }, e._PixelCollection_ToShortArray = function() {
      return (e._PixelCollection_ToShortArray = e.asm._j).apply(null, arguments);
    }, e._Quantum_Depth_Get = function() {
      return (e._Quantum_Depth_Get = e.asm.$j).apply(null, arguments);
    }, e._Quantum_Max_Get = function() {
      return (e._Quantum_Max_Get = e.asm.ak).apply(null, arguments);
    }, e._Quantum_ScaleToByte = function() {
      return (e._Quantum_ScaleToByte = e.asm.bk).apply(null, arguments);
    }, e._ResourceLimits_Area_Get = function() {
      return (e._ResourceLimits_Area_Get = e.asm.ck).apply(null, arguments);
    }, e._ResourceLimits_Area_Set = function() {
      return (e._ResourceLimits_Area_Set = e.asm.dk).apply(null, arguments);
    }, e._ResourceLimits_Disk_Get = function() {
      return (e._ResourceLimits_Disk_Get = e.asm.ek).apply(null, arguments);
    }, e._ResourceLimits_Disk_Set = function() {
      return (e._ResourceLimits_Disk_Set = e.asm.fk).apply(null, arguments);
    }, e._ResourceLimits_Height_Get = function() {
      return (e._ResourceLimits_Height_Get = e.asm.gk).apply(null, arguments);
    }, e._ResourceLimits_Height_Set = function() {
      return (e._ResourceLimits_Height_Set = e.asm.hk).apply(null, arguments);
    }, e._ResourceLimits_ListLength_Get = function() {
      return (e._ResourceLimits_ListLength_Get = e.asm.ik).apply(null, arguments);
    }, e._ResourceLimits_ListLength_Set = function() {
      return (e._ResourceLimits_ListLength_Set = e.asm.jk).apply(null, arguments);
    }, e._ResourceLimits_MaxMemoryRequest_Get = function() {
      return (e._ResourceLimits_MaxMemoryRequest_Get = e.asm.kk).apply(null, arguments);
    }, e._ResourceLimits_MaxMemoryRequest_Set = function() {
      return (e._ResourceLimits_MaxMemoryRequest_Set = e.asm.lk).apply(null, arguments);
    }, e._ResourceLimits_MaxProfileSize_Get = function() {
      return (e._ResourceLimits_MaxProfileSize_Get = e.asm.mk).apply(null, arguments);
    }, e._ResourceLimits_MaxProfileSize_Set = function() {
      return (e._ResourceLimits_MaxProfileSize_Set = e.asm.nk).apply(null, arguments);
    }, e._ResourceLimits_Memory_Get = function() {
      return (e._ResourceLimits_Memory_Get = e.asm.ok).apply(null, arguments);
    }, e._ResourceLimits_Memory_Set = function() {
      return (e._ResourceLimits_Memory_Set = e.asm.pk).apply(null, arguments);
    }, e._ResourceLimits_Thread_Get = function() {
      return (e._ResourceLimits_Thread_Get = e.asm.qk).apply(null, arguments);
    }, e._ResourceLimits_Thread_Set = function() {
      return (e._ResourceLimits_Thread_Set = e.asm.rk).apply(null, arguments);
    }, e._ResourceLimits_Throttle_Get = function() {
      return (e._ResourceLimits_Throttle_Get = e.asm.sk).apply(null, arguments);
    }, e._ResourceLimits_Throttle_Set = function() {
      return (e._ResourceLimits_Throttle_Set = e.asm.tk).apply(null, arguments);
    }, e._ResourceLimits_Time_Get = function() {
      return (e._ResourceLimits_Time_Get = e.asm.uk).apply(null, arguments);
    }, e._ResourceLimits_Time_Set = function() {
      return (e._ResourceLimits_Time_Set = e.asm.vk).apply(null, arguments);
    }, e._ResourceLimits_Width_Get = function() {
      return (e._ResourceLimits_Width_Get = e.asm.wk).apply(null, arguments);
    }, e._ResourceLimits_Width_Set = function() {
      return (e._ResourceLimits_Width_Set = e.asm.xk).apply(null, arguments);
    }, e._ResourceLimits_LimitMemory = function() {
      return (e._ResourceLimits_LimitMemory = e.asm.yk).apply(null, arguments);
    }, e._DrawingSettings_Create = function() {
      return (e._DrawingSettings_Create = e.asm.zk).apply(null, arguments);
    }, e._DrawingSettings_Dispose = function() {
      return (e._DrawingSettings_Dispose = e.asm.Ak).apply(null, arguments);
    }, e._DrawingSettings_BorderColor_Get = function() {
      return (e._DrawingSettings_BorderColor_Get = e.asm.Bk).apply(null, arguments);
    }, e._DrawingSettings_BorderColor_Set = function() {
      return (e._DrawingSettings_BorderColor_Set = e.asm.Ck).apply(null, arguments);
    }, e._DrawingSettings_FillColor_Get = function() {
      return (e._DrawingSettings_FillColor_Get = e.asm.Dk).apply(null, arguments);
    }, e._DrawingSettings_FillColor_Set = function() {
      return (e._DrawingSettings_FillColor_Set = e.asm.Ek).apply(null, arguments);
    }, e._DrawingSettings_FillRule_Get = function() {
      return (e._DrawingSettings_FillRule_Get = e.asm.Fk).apply(null, arguments);
    }, e._DrawingSettings_FillRule_Set = function() {
      return (e._DrawingSettings_FillRule_Set = e.asm.Gk).apply(null, arguments);
    }, e._DrawingSettings_Font_Get = function() {
      return (e._DrawingSettings_Font_Get = e.asm.Hk).apply(null, arguments);
    }, e._DrawingSettings_Font_Set = function() {
      return (e._DrawingSettings_Font_Set = e.asm.Ik).apply(null, arguments);
    }, e._DrawingSettings_FontFamily_Get = function() {
      return (e._DrawingSettings_FontFamily_Get = e.asm.Jk).apply(null, arguments);
    }, e._DrawingSettings_FontFamily_Set = function() {
      return (e._DrawingSettings_FontFamily_Set = e.asm.Kk).apply(null, arguments);
    }, e._DrawingSettings_FontPointsize_Get = function() {
      return (e._DrawingSettings_FontPointsize_Get = e.asm.Lk).apply(null, arguments);
    }, e._DrawingSettings_FontPointsize_Set = function() {
      return (e._DrawingSettings_FontPointsize_Set = e.asm.Mk).apply(null, arguments);
    }, e._DrawingSettings_FontStyle_Get = function() {
      return (e._DrawingSettings_FontStyle_Get = e.asm.Nk).apply(null, arguments);
    }, e._DrawingSettings_FontStyle_Set = function() {
      return (e._DrawingSettings_FontStyle_Set = e.asm.Ok).apply(null, arguments);
    }, e._DrawingSettings_FontWeight_Get = function() {
      return (e._DrawingSettings_FontWeight_Get = e.asm.Pk).apply(null, arguments);
    }, e._DrawingSettings_FontWeight_Set = function() {
      return (e._DrawingSettings_FontWeight_Set = e.asm.Qk).apply(null, arguments);
    }, e._DrawingSettings_StrokeAntiAlias_Get = function() {
      return (e._DrawingSettings_StrokeAntiAlias_Get = e.asm.Rk).apply(null, arguments);
    }, e._DrawingSettings_StrokeAntiAlias_Set = function() {
      return (e._DrawingSettings_StrokeAntiAlias_Set = e.asm.Sk).apply(null, arguments);
    }, e._DrawingSettings_StrokeColor_Get = function() {
      return (e._DrawingSettings_StrokeColor_Get = e.asm.Tk).apply(null, arguments);
    }, e._DrawingSettings_StrokeColor_Set = function() {
      return (e._DrawingSettings_StrokeColor_Set = e.asm.Uk).apply(null, arguments);
    }, e._DrawingSettings_StrokeDashOffset_Get = function() {
      return (e._DrawingSettings_StrokeDashOffset_Get = e.asm.Vk).apply(null, arguments);
    }, e._DrawingSettings_StrokeDashOffset_Set = function() {
      return (e._DrawingSettings_StrokeDashOffset_Set = e.asm.Wk).apply(null, arguments);
    }, e._DrawingSettings_StrokeLineCap_Get = function() {
      return (e._DrawingSettings_StrokeLineCap_Get = e.asm.Xk).apply(null, arguments);
    }, e._DrawingSettings_StrokeLineCap_Set = function() {
      return (e._DrawingSettings_StrokeLineCap_Set = e.asm.Yk).apply(null, arguments);
    }, e._DrawingSettings_StrokeLineJoin_Get = function() {
      return (e._DrawingSettings_StrokeLineJoin_Get = e.asm.Zk).apply(null, arguments);
    }, e._DrawingSettings_StrokeLineJoin_Set = function() {
      return (e._DrawingSettings_StrokeLineJoin_Set = e.asm._k).apply(null, arguments);
    }, e._DrawingSettings_StrokeMiterLimit_Get = function() {
      return (e._DrawingSettings_StrokeMiterLimit_Get = e.asm.$k).apply(null, arguments);
    }, e._DrawingSettings_StrokeMiterLimit_Set = function() {
      return (e._DrawingSettings_StrokeMiterLimit_Set = e.asm.al).apply(null, arguments);
    }, e._DrawingSettings_StrokeWidth_Get = function() {
      return (e._DrawingSettings_StrokeWidth_Get = e.asm.bl).apply(null, arguments);
    }, e._DrawingSettings_StrokeWidth_Set = function() {
      return (e._DrawingSettings_StrokeWidth_Set = e.asm.cl).apply(null, arguments);
    }, e._DrawingSettings_TextAntiAlias_Get = function() {
      return (e._DrawingSettings_TextAntiAlias_Get = e.asm.dl).apply(null, arguments);
    }, e._DrawingSettings_TextAntiAlias_Set = function() {
      return (e._DrawingSettings_TextAntiAlias_Set = e.asm.el).apply(null, arguments);
    }, e._DrawingSettings_TextDirection_Get = function() {
      return (e._DrawingSettings_TextDirection_Get = e.asm.fl).apply(null, arguments);
    }, e._DrawingSettings_TextDirection_Set = function() {
      return (e._DrawingSettings_TextDirection_Set = e.asm.gl).apply(null, arguments);
    }, e._DrawingSettings_TextEncoding_Get = function() {
      return (e._DrawingSettings_TextEncoding_Get = e.asm.hl).apply(null, arguments);
    }, e._DrawingSettings_TextEncoding_Set = function() {
      return (e._DrawingSettings_TextEncoding_Set = e.asm.il).apply(null, arguments);
    }, e._DrawingSettings_TextGravity_Get = function() {
      return (e._DrawingSettings_TextGravity_Get = e.asm.jl).apply(null, arguments);
    }, e._DrawingSettings_TextGravity_Set = function() {
      return (e._DrawingSettings_TextGravity_Set = e.asm.kl).apply(null, arguments);
    }, e._DrawingSettings_TextInterlineSpacing_Get = function() {
      return (e._DrawingSettings_TextInterlineSpacing_Get = e.asm.ll).apply(null, arguments);
    }, e._DrawingSettings_TextInterlineSpacing_Set = function() {
      return (e._DrawingSettings_TextInterlineSpacing_Set = e.asm.ml).apply(null, arguments);
    }, e._DrawingSettings_TextInterwordSpacing_Get = function() {
      return (e._DrawingSettings_TextInterwordSpacing_Get = e.asm.nl).apply(null, arguments);
    }, e._DrawingSettings_TextInterwordSpacing_Set = function() {
      return (e._DrawingSettings_TextInterwordSpacing_Set = e.asm.ol).apply(null, arguments);
    }, e._DrawingSettings_TextKerning_Get = function() {
      return (e._DrawingSettings_TextKerning_Get = e.asm.pl).apply(null, arguments);
    }, e._DrawingSettings_TextKerning_Set = function() {
      return (e._DrawingSettings_TextKerning_Set = e.asm.ql).apply(null, arguments);
    }, e._DrawingSettings_TextUnderColor_Get = function() {
      return (e._DrawingSettings_TextUnderColor_Get = e.asm.rl).apply(null, arguments);
    }, e._DrawingSettings_TextUnderColor_Set = function() {
      return (e._DrawingSettings_TextUnderColor_Set = e.asm.sl).apply(null, arguments);
    }, e._DrawingSettings_SetAffine = function() {
      return (e._DrawingSettings_SetAffine = e.asm.tl).apply(null, arguments);
    }, e._DrawingSettings_SetFillPattern = function() {
      return (e._DrawingSettings_SetFillPattern = e.asm.ul).apply(null, arguments);
    }, e._DrawingSettings_SetStrokeDashArray = function() {
      return (e._DrawingSettings_SetStrokeDashArray = e.asm.vl).apply(null, arguments);
    }, e._DrawingSettings_SetStrokePattern = function() {
      return (e._DrawingSettings_SetStrokePattern = e.asm.wl).apply(null, arguments);
    }, e._DrawingSettings_SetText = function() {
      return (e._DrawingSettings_SetText = e.asm.xl).apply(null, arguments);
    }, e._MagickSettings_Create = function() {
      return (e._MagickSettings_Create = e.asm.yl).apply(null, arguments);
    }, e._MagickSettings_Dispose = function() {
      return (e._MagickSettings_Dispose = e.asm.zl).apply(null, arguments);
    }, e._MagickSettings_AntiAlias_Get = function() {
      return (e._MagickSettings_AntiAlias_Get = e.asm.Al).apply(null, arguments);
    }, e._MagickSettings_AntiAlias_Set = function() {
      return (e._MagickSettings_AntiAlias_Set = e.asm.Bl).apply(null, arguments);
    }, e._MagickSettings_BackgroundColor_Get = function() {
      return (e._MagickSettings_BackgroundColor_Get = e.asm.Cl).apply(null, arguments);
    }, e._MagickSettings_BackgroundColor_Set = function() {
      return (e._MagickSettings_BackgroundColor_Set = e.asm.Dl).apply(null, arguments);
    }, e._MagickSettings_ColorSpace_Get = function() {
      return (e._MagickSettings_ColorSpace_Get = e.asm.El).apply(null, arguments);
    }, e._MagickSettings_ColorSpace_Set = function() {
      return (e._MagickSettings_ColorSpace_Set = e.asm.Fl).apply(null, arguments);
    }, e._MagickSettings_ColorType_Get = function() {
      return (e._MagickSettings_ColorType_Get = e.asm.Gl).apply(null, arguments);
    }, e._MagickSettings_ColorType_Set = function() {
      return (e._MagickSettings_ColorType_Set = e.asm.Hl).apply(null, arguments);
    }, e._MagickSettings_Compression_Get = function() {
      return (e._MagickSettings_Compression_Get = e.asm.Il).apply(null, arguments);
    }, e._MagickSettings_Compression_Set = function() {
      return (e._MagickSettings_Compression_Set = e.asm.Jl).apply(null, arguments);
    }, e._MagickSettings_Debug_Get = function() {
      return (e._MagickSettings_Debug_Get = e.asm.Kl).apply(null, arguments);
    }, e._MagickSettings_Debug_Set = function() {
      return (e._MagickSettings_Debug_Set = e.asm.Ll).apply(null, arguments);
    }, e._MagickSettings_Density_Get = function() {
      return (e._MagickSettings_Density_Get = e.asm.Ml).apply(null, arguments);
    }, e._MagickSettings_Density_Set = function() {
      return (e._MagickSettings_Density_Set = e.asm.Nl).apply(null, arguments);
    }, e._MagickSettings_Depth_Get = function() {
      return (e._MagickSettings_Depth_Get = e.asm.Ol).apply(null, arguments);
    }, e._MagickSettings_Depth_Set = function() {
      return (e._MagickSettings_Depth_Set = e.asm.Pl).apply(null, arguments);
    }, e._MagickSettings_Endian_Get = function() {
      return (e._MagickSettings_Endian_Get = e.asm.Ql).apply(null, arguments);
    }, e._MagickSettings_Endian_Set = function() {
      return (e._MagickSettings_Endian_Set = e.asm.Rl).apply(null, arguments);
    }, e._MagickSettings_Extract_Get = function() {
      return (e._MagickSettings_Extract_Get = e.asm.Sl).apply(null, arguments);
    }, e._MagickSettings_Extract_Set = function() {
      return (e._MagickSettings_Extract_Set = e.asm.Tl).apply(null, arguments);
    }, e._MagickSettings_Format_Get = function() {
      return (e._MagickSettings_Format_Get = e.asm.Ul).apply(null, arguments);
    }, e._MagickSettings_Format_Set = function() {
      return (e._MagickSettings_Format_Set = e.asm.Vl).apply(null, arguments);
    }, e._MagickSettings_FontPointsize_Get = function() {
      return (e._MagickSettings_FontPointsize_Get = e.asm.Wl).apply(null, arguments);
    }, e._MagickSettings_FontPointsize_Set = function() {
      return (e._MagickSettings_FontPointsize_Set = e.asm.Xl).apply(null, arguments);
    }, e._MagickSettings_Interlace_Get = function() {
      return (e._MagickSettings_Interlace_Get = e.asm.Yl).apply(null, arguments);
    }, e._MagickSettings_Interlace_Set = function() {
      return (e._MagickSettings_Interlace_Set = e.asm.Zl).apply(null, arguments);
    }, e._MagickSettings_Monochrome_Get = function() {
      return (e._MagickSettings_Monochrome_Get = e.asm._l).apply(null, arguments);
    }, e._MagickSettings_Monochrome_Set = function() {
      return (e._MagickSettings_Monochrome_Set = e.asm.$l).apply(null, arguments);
    }, e._MagickSettings_Verbose_Get = function() {
      return (e._MagickSettings_Verbose_Get = e.asm.am).apply(null, arguments);
    }, e._MagickSettings_Verbose_Set = function() {
      return (e._MagickSettings_Verbose_Set = e.asm.bm).apply(null, arguments);
    }, e._MagickSettings_SetColorFuzz = function() {
      return (e._MagickSettings_SetColorFuzz = e.asm.cm).apply(null, arguments);
    }, e._MagickSettings_SetFileName = function() {
      return (e._MagickSettings_SetFileName = e.asm.dm).apply(null, arguments);
    }, e._MagickSettings_SetFont = function() {
      return (e._MagickSettings_SetFont = e.asm.em).apply(null, arguments);
    }, e._MagickSettings_SetNumberScenes = function() {
      return (e._MagickSettings_SetNumberScenes = e.asm.fm).apply(null, arguments);
    }, e._MagickSettings_SetOption = function() {
      return (e._MagickSettings_SetOption = e.asm.gm).apply(null, arguments);
    }, e._MagickSettings_SetPage = function() {
      return (e._MagickSettings_SetPage = e.asm.hm).apply(null, arguments);
    }, e._MagickSettings_SetPing = function() {
      return (e._MagickSettings_SetPing = e.asm.im).apply(null, arguments);
    }, e._MagickSettings_SetQuality = function() {
      return (e._MagickSettings_SetQuality = e.asm.jm).apply(null, arguments);
    }, e._MagickSettings_SetScenes = function() {
      return (e._MagickSettings_SetScenes = e.asm.km).apply(null, arguments);
    }, e._MagickSettings_SetScene = function() {
      return (e._MagickSettings_SetScene = e.asm.lm).apply(null, arguments);
    }, e._MagickSettings_SetSize = function() {
      return (e._MagickSettings_SetSize = e.asm.mm).apply(null, arguments);
    }, e._MontageSettings_Create = function() {
      return (e._MontageSettings_Create = e.asm.nm).apply(null, arguments);
    }, e._MontageSettings_Dispose = function() {
      return (e._MontageSettings_Dispose = e.asm.om).apply(null, arguments);
    }, e._MontageSettings_SetBackgroundColor = function() {
      return (e._MontageSettings_SetBackgroundColor = e.asm.pm).apply(null, arguments);
    }, e._MontageSettings_SetBorderColor = function() {
      return (e._MontageSettings_SetBorderColor = e.asm.qm).apply(null, arguments);
    }, e._MontageSettings_SetBorderWidth = function() {
      return (e._MontageSettings_SetBorderWidth = e.asm.rm).apply(null, arguments);
    }, e._MontageSettings_SetFillColor = function() {
      return (e._MontageSettings_SetFillColor = e.asm.sm).apply(null, arguments);
    }, e._MontageSettings_SetFont = function() {
      return (e._MontageSettings_SetFont = e.asm.tm).apply(null, arguments);
    }, e._MontageSettings_SetFontPointsize = function() {
      return (e._MontageSettings_SetFontPointsize = e.asm.um).apply(null, arguments);
    }, e._MontageSettings_SetFrameGeometry = function() {
      return (e._MontageSettings_SetFrameGeometry = e.asm.vm).apply(null, arguments);
    }, e._MontageSettings_SetGeometry = function() {
      return (e._MontageSettings_SetGeometry = e.asm.wm).apply(null, arguments);
    }, e._MontageSettings_SetGravity = function() {
      return (e._MontageSettings_SetGravity = e.asm.xm).apply(null, arguments);
    }, e._MontageSettings_SetShadow = function() {
      return (e._MontageSettings_SetShadow = e.asm.ym).apply(null, arguments);
    }, e._MontageSettings_SetStrokeColor = function() {
      return (e._MontageSettings_SetStrokeColor = e.asm.zm).apply(null, arguments);
    }, e._MontageSettings_SetTextureFileName = function() {
      return (e._MontageSettings_SetTextureFileName = e.asm.Am).apply(null, arguments);
    }, e._MontageSettings_SetTileGeometry = function() {
      return (e._MontageSettings_SetTileGeometry = e.asm.Bm).apply(null, arguments);
    }, e._MontageSettings_SetTitle = function() {
      return (e._MontageSettings_SetTitle = e.asm.Cm).apply(null, arguments);
    }, e._QuantizeSettings_SetColors = function() {
      return (e._QuantizeSettings_SetColors = e.asm.Dm).apply(null, arguments);
    }, e._QuantizeSettings_SetColorSpace = function() {
      return (e._QuantizeSettings_SetColorSpace = e.asm.Em).apply(null, arguments);
    }, e._QuantizeSettings_SetDitherMethod = function() {
      return (e._QuantizeSettings_SetDitherMethod = e.asm.Fm).apply(null, arguments);
    }, e._QuantizeSettings_SetMeasureErrors = function() {
      return (e._QuantizeSettings_SetMeasureErrors = e.asm.Gm).apply(null, arguments);
    }, e._QuantizeSettings_SetTreeDepth = function() {
      return (e._QuantizeSettings_SetTreeDepth = e.asm.Hm).apply(null, arguments);
    }, e._ChannelMoments_Centroid_Get = function() {
      return (e._ChannelMoments_Centroid_Get = e.asm.Im).apply(null, arguments);
    }, e._ChannelMoments_EllipseAngle_Get = function() {
      return (e._ChannelMoments_EllipseAngle_Get = e.asm.Jm).apply(null, arguments);
    }, e._ChannelMoments_EllipseAxis_Get = function() {
      return (e._ChannelMoments_EllipseAxis_Get = e.asm.Km).apply(null, arguments);
    }, e._ChannelMoments_EllipseEccentricity_Get = function() {
      return (e._ChannelMoments_EllipseEccentricity_Get = e.asm.Lm).apply(null, arguments);
    }, e._ChannelMoments_EllipseIntensity_Get = function() {
      return (e._ChannelMoments_EllipseIntensity_Get = e.asm.Mm).apply(null, arguments);
    }, e._ChannelMoments_GetHuInvariants = function() {
      return (e._ChannelMoments_GetHuInvariants = e.asm.Nm).apply(null, arguments);
    }, e._ChannelPerceptualHash_GetHuPhash = function() {
      return (e._ChannelPerceptualHash_GetHuPhash = e.asm.Om).apply(null, arguments);
    }, e._ChannelStatistics_Depth_Get = function() {
      return (e._ChannelStatistics_Depth_Get = e.asm.Pm).apply(null, arguments);
    }, e._ChannelStatistics_Entropy_Get = function() {
      return (e._ChannelStatistics_Entropy_Get = e.asm.Qm).apply(null, arguments);
    }, e._ChannelStatistics_Kurtosis_Get = function() {
      return (e._ChannelStatistics_Kurtosis_Get = e.asm.Rm).apply(null, arguments);
    }, e._ChannelStatistics_Maximum_Get = function() {
      return (e._ChannelStatistics_Maximum_Get = e.asm.Sm).apply(null, arguments);
    }, e._ChannelStatistics_Mean_Get = function() {
      return (e._ChannelStatistics_Mean_Get = e.asm.Tm).apply(null, arguments);
    }, e._ChannelStatistics_Minimum_Get = function() {
      return (e._ChannelStatistics_Minimum_Get = e.asm.Um).apply(null, arguments);
    }, e._ChannelStatistics_Skewness_Get = function() {
      return (e._ChannelStatistics_Skewness_Get = e.asm.Vm).apply(null, arguments);
    }, e._ChannelStatistics_StandardDeviation_Get = function() {
      return (e._ChannelStatistics_StandardDeviation_Get = e.asm.Wm).apply(null, arguments);
    }, e._Moments_DisposeList = function() {
      return (e._Moments_DisposeList = e.asm.Xm).apply(null, arguments);
    }, e._Moments_GetInstance = function() {
      return (e._Moments_GetInstance = e.asm.Ym).apply(null, arguments);
    }, e._PerceptualHash_DisposeList = function() {
      return (e._PerceptualHash_DisposeList = e.asm.Zm).apply(null, arguments);
    }, e._PerceptualHash_GetInstance = function() {
      return (e._PerceptualHash_GetInstance = e.asm._m).apply(null, arguments);
    }, e._Statistics_DisposeList = function() {
      return (e._Statistics_DisposeList = e.asm.$m).apply(null, arguments);
    }, e._Statistics_GetInstance = function() {
      return (e._Statistics_GetInstance = e.asm.an).apply(null, arguments);
    }, e._ConnectedComponent_DisposeList = function() {
      return (e._ConnectedComponent_DisposeList = e.asm.bn).apply(null, arguments);
    }, e._ConnectedComponent_GetArea = function() {
      return (e._ConnectedComponent_GetArea = e.asm.cn).apply(null, arguments);
    }, e._ConnectedComponent_GetCentroid = function() {
      return (e._ConnectedComponent_GetCentroid = e.asm.dn).apply(null, arguments);
    }, e._ConnectedComponent_GetColor = function() {
      return (e._ConnectedComponent_GetColor = e.asm.en).apply(null, arguments);
    }, e._ConnectedComponent_GetHeight = function() {
      return (e._ConnectedComponent_GetHeight = e.asm.fn).apply(null, arguments);
    }, e._ConnectedComponent_GetId = function() {
      return (e._ConnectedComponent_GetId = e.asm.gn).apply(null, arguments);
    }, e._ConnectedComponent_GetWidth = function() {
      return (e._ConnectedComponent_GetWidth = e.asm.hn).apply(null, arguments);
    }, e._ConnectedComponent_GetX = function() {
      return (e._ConnectedComponent_GetX = e.asm.jn).apply(null, arguments);
    }, e._ConnectedComponent_GetY = function() {
      return (e._ConnectedComponent_GetY = e.asm.kn).apply(null, arguments);
    }, e._ConnectedComponent_GetInstance = function() {
      return (e._ConnectedComponent_GetInstance = e.asm.ln).apply(null, arguments);
    }, e._MagickGeometry_Create = function() {
      return (e._MagickGeometry_Create = e.asm.mn).apply(null, arguments);
    }, e._MagickGeometry_Dispose = function() {
      return (e._MagickGeometry_Dispose = e.asm.nn).apply(null, arguments);
    }, e._MagickGeometry_X_Get = function() {
      return (e._MagickGeometry_X_Get = e.asm.on).apply(null, arguments);
    };
    var rr = function() {
      return (rr = e.asm.pn).apply(null, arguments);
    };
    e._MagickGeometry_Y_Get = function() {
      return (e._MagickGeometry_Y_Get = e.asm.qn).apply(null, arguments);
    }, e._MagickGeometry_Width_Get = function() {
      return (e._MagickGeometry_Width_Get = e.asm.rn).apply(null, arguments);
    }, e._MagickGeometry_Height_Get = function() {
      return (e._MagickGeometry_Height_Get = e.asm.sn).apply(null, arguments);
    }, e._MagickGeometry_Initialize = function() {
      return (e._MagickGeometry_Initialize = e.asm.tn).apply(null, arguments);
    }, e._MagickRectangle_Dispose = function() {
      return (e._MagickRectangle_Dispose = e.asm.un).apply(null, arguments);
    }, e._MagickRectangle_X_Get = function() {
      return (e._MagickRectangle_X_Get = e.asm.vn).apply(null, arguments);
    }, e._MagickRectangle_X_Set = function() {
      return (e._MagickRectangle_X_Set = e.asm.wn).apply(null, arguments);
    }, e._MagickRectangle_Y_Get = function() {
      return (e._MagickRectangle_Y_Get = e.asm.xn).apply(null, arguments);
    }, e._MagickRectangle_Y_Set = function() {
      return (e._MagickRectangle_Y_Set = e.asm.yn).apply(null, arguments);
    }, e._MagickRectangle_Width_Get = function() {
      return (e._MagickRectangle_Width_Get = e.asm.zn).apply(null, arguments);
    }, e._MagickRectangle_Width_Set = function() {
      return (e._MagickRectangle_Width_Set = e.asm.An).apply(null, arguments);
    }, e._MagickRectangle_Height_Get = function() {
      return (e._MagickRectangle_Height_Get = e.asm.Bn).apply(null, arguments);
    }, e._MagickRectangle_Height_Set = function() {
      return (e._MagickRectangle_Height_Set = e.asm.Cn).apply(null, arguments);
    }, e._MagickRectangle_FromPageSize = function() {
      return (e._MagickRectangle_FromPageSize = e.asm.Dn).apply(null, arguments);
    }, e._OffsetInfo_Create = function() {
      return (e._OffsetInfo_Create = e.asm.En).apply(null, arguments);
    }, e._OffsetInfo_Dispose = function() {
      return (e._OffsetInfo_Dispose = e.asm.Fn).apply(null, arguments);
    }, e._OffsetInfo_SetX = function() {
      return (e._OffsetInfo_SetX = e.asm.Gn).apply(null, arguments);
    }, e._OffsetInfo_SetY = function() {
      return (e._OffsetInfo_SetY = e.asm.Hn).apply(null, arguments);
    }, e._PointInfo_X_Get = function() {
      return (e._PointInfo_X_Get = e.asm.In).apply(null, arguments);
    }, e._PointInfo_Y_Get = function() {
      return (e._PointInfo_Y_Get = e.asm.Jn).apply(null, arguments);
    }, e._PointInfoCollection_Create = function() {
      return (e._PointInfoCollection_Create = e.asm.Kn).apply(null, arguments);
    }, e._PointInfoCollection_Dispose = function() {
      return (e._PointInfoCollection_Dispose = e.asm.Ln).apply(null, arguments);
    }, e._PointInfoCollection_GetX = function() {
      return (e._PointInfoCollection_GetX = e.asm.Mn).apply(null, arguments);
    }, e._PointInfoCollection_GetY = function() {
      return (e._PointInfoCollection_GetY = e.asm.Nn).apply(null, arguments);
    }, e._PointInfoCollection_Set = function() {
      return (e._PointInfoCollection_Set = e.asm.On).apply(null, arguments);
    }, e._PrimaryInfo_Dispose = function() {
      return (e._PrimaryInfo_Dispose = e.asm.Pn).apply(null, arguments);
    }, e._PrimaryInfo_X_Get = function() {
      return (e._PrimaryInfo_X_Get = e.asm.Qn).apply(null, arguments);
    }, e._PrimaryInfo_X_Set = function() {
      return (e._PrimaryInfo_X_Set = e.asm.Rn).apply(null, arguments);
    }, e._PrimaryInfo_Y_Get = function() {
      return (e._PrimaryInfo_Y_Get = e.asm.Sn).apply(null, arguments);
    }, e._PrimaryInfo_Y_Set = function() {
      return (e._PrimaryInfo_Y_Set = e.asm.Tn).apply(null, arguments);
    }, e._PrimaryInfo_Z_Get = function() {
      return (e._PrimaryInfo_Z_Get = e.asm.Un).apply(null, arguments);
    }, e._PrimaryInfo_Z_Set = function() {
      return (e._PrimaryInfo_Z_Set = e.asm.Vn).apply(null, arguments);
    }, e._StringInfo_Length_Get = function() {
      return (e._StringInfo_Length_Get = e.asm.Wn).apply(null, arguments);
    }, e._StringInfo_Datum_Get = function() {
      return (e._StringInfo_Datum_Get = e.asm.Xn).apply(null, arguments);
    }, e._TypeMetric_Dispose = function() {
      return (e._TypeMetric_Dispose = e.asm.Yn).apply(null, arguments);
    }, e._TypeMetric_Ascent_Get = function() {
      return (e._TypeMetric_Ascent_Get = e.asm.Zn).apply(null, arguments);
    }, e._TypeMetric_Descent_Get = function() {
      return (e._TypeMetric_Descent_Get = e.asm._n).apply(null, arguments);
    }, e._TypeMetric_MaxHorizontalAdvance_Get = function() {
      return (e._TypeMetric_MaxHorizontalAdvance_Get = e.asm.$n).apply(null, arguments);
    }, e._TypeMetric_TextHeight_Get = function() {
      return (e._TypeMetric_TextHeight_Get = e.asm.ao).apply(null, arguments);
    }, e._TypeMetric_TextWidth_Get = function() {
      return (e._TypeMetric_TextWidth_Get = e.asm.bo).apply(null, arguments);
    }, e._TypeMetric_UnderlinePosition_Get = function() {
      return (e._TypeMetric_UnderlinePosition_Get = e.asm.co).apply(null, arguments);
    }, e._TypeMetric_UnderlineThickness_Get = function() {
      return (e._TypeMetric_UnderlineThickness_Get = e.asm.eo).apply(null, arguments);
    };
    var ar = function() {
      return (ar = e.asm.fo).apply(null, arguments);
    };
    e.__embind_initialize_bindings = function() {
      return (e.__embind_initialize_bindings = e.asm.go).apply(null, arguments);
    };
    var ir = function() {
      return (ir = e.asm.ho).apply(null, arguments);
    }, H = function() {
      return (H = e.asm.io).apply(null, arguments);
    }, U = function() {
      return (U = e.asm.jo).apply(null, arguments);
    }, F = function() {
      return (F = e.asm.ko).apply(null, arguments);
    }, sr = function() {
      return (sr = e.asm.lo).apply(null, arguments);
    }, ur = function() {
      return (ur = e.asm.mo).apply(null, arguments);
    };
    function bs(n, a, i, s) {
      var u = U();
      try {
        z(n)(a, i, s);
      } catch (c) {
        if (F(u), c !== c + 0) throw c;
        H(1, 0);
      }
    }
    function Ps(n, a, i, s) {
      var u = U();
      try {
        return z(n)(a, i, s);
      } catch (c) {
        if (F(u), c !== c + 0) throw c;
        H(1, 0);
      }
    }
    function As(n, a, i) {
      var s = U();
      try {
        return z(n)(a, i);
      } catch (u) {
        if (F(s), u !== u + 0) throw u;
        H(1, 0);
      }
    }
    function Es(n, a) {
      var i = U();
      try {
        return z(n)(a);
      } catch (s) {
        if (F(i), s !== s + 0) throw s;
        H(1, 0);
      }
    }
    function Ts(n, a) {
      var i = U();
      try {
        z(n)(a);
      } catch (s) {
        if (F(i), s !== s + 0) throw s;
        H(1, 0);
      }
    }
    function Rs(n, a, i) {
      var s = U();
      try {
        z(n)(a, i);
      } catch (u) {
        if (F(s), u !== u + 0) throw u;
        H(1, 0);
      }
    }
    function Cs(n, a, i, s, u) {
      var c = U();
      try {
        z(n)(a, i, s, u);
      } catch (m) {
        if (F(c), m !== m + 0) throw m;
        H(1, 0);
      }
    }
    function Ws(n, a, i, s, u) {
      var c = U();
      try {
        return z(n)(a, i, s, u);
      } catch (m) {
        if (F(c), m !== m + 0) throw m;
        H(1, 0);
      }
    }
    function Bs(n, a, i, s) {
      var u = U();
      try {
        return z(n)(a, i, s);
      } catch (c) {
        if (F(u), c !== c + 0) throw c;
        return H(1, 0), 0n;
      }
    }
    function Ls(n, a) {
      var i = U();
      try {
        return z(n)(a);
      } catch (s) {
        if (F(i), s !== s + 0) throw s;
        return H(1, 0), 0n;
      }
    }
    function xs(n, a, i, s, u, c, m, f, d) {
      var y = U();
      try {
        return z(n)(a, i, s, u, c, m, f, d);
      } catch (k) {
        if (F(y), k !== k + 0) throw k;
        H(1, 0);
      }
    }
    function zs(n) {
      var a = U();
      try {
        return z(n)();
      } catch (i) {
        if (F(a), i !== i + 0) throw i;
        H(1, 0);
      }
    }
    function Ns(n, a, i, s, u, c, m) {
      var f = U();
      try {
        return z(n)(a, i, s, u, c, m);
      } catch (d) {
        if (F(f), d !== d + 0) throw d;
        H(1, 0);
      }
    }
    function Hs(n, a, i, s, u) {
      var c = U();
      try {
        return z(n)(a, i, s, u);
      } catch (m) {
        if (F(c), m !== m + 0) throw m;
        H(1, 0);
      }
    }
    function Us(n, a, i) {
      var s = U();
      try {
        return z(n)(a, i);
      } catch (u) {
        if (F(s), u !== u + 0) throw u;
        H(1, 0);
      }
    }
    function Fs(n, a, i) {
      var s = U();
      try {
        z(n)(a, i);
      } catch (u) {
        if (F(s), u !== u + 0) throw u;
        H(1, 0);
      }
    }
    function $s(n, a, i, s, u, c) {
      var m = U();
      try {
        return z(n)(a, i, s, u, c);
      } catch (f) {
        if (F(m), f !== f + 0) throw f;
        H(1, 0);
      }
    }
    function Ys(n, a, i) {
      var s = U();
      try {
        return z(n)(a, i);
      } catch (u) {
        if (F(s), u !== u + 0) throw u;
        H(1, 0);
      }
    }
    function js(n) {
      var a = U();
      try {
        z(n)();
      } catch (i) {
        if (F(a), i !== i + 0) throw i;
        H(1, 0);
      }
    }
    function Xs(n, a, i, s, u, c) {
      var m = U();
      try {
        z(n)(a, i, s, u, c);
      } catch (f) {
        if (F(m), f !== f + 0) throw f;
        H(1, 0);
      }
    }
    function Vs(n, a, i, s, u, c, m, f) {
      var d = U();
      try {
        return z(n)(a, i, s, u, c, m, f);
      } catch (y) {
        if (F(d), y !== y + 0) throw y;
        H(1, 0);
      }
    }
    function qs(n, a, i, s, u, c, m, f, d, y) {
      var k = U();
      try {
        return z(n)(a, i, s, u, c, m, f, d, y);
      } catch (D) {
        if (F(k), D !== D + 0) throw D;
        H(1, 0);
      }
    }
    function Qs(n, a, i, s) {
      var u = U();
      try {
        z(n)(a, i, s);
      } catch (c) {
        if (F(u), c !== c + 0) throw c;
        H(1, 0);
      }
    }
    function Js(n, a, i, s, u, c, m, f, d, y, k) {
      var D = U();
      try {
        z(n)(a, i, s, u, c, m, f, d, y, k);
      } catch (M) {
        if (F(D), M !== M + 0) throw M;
        H(1, 0);
      }
    }
    function Ks(n, a, i, s, u, c, m, f, d, y) {
      var k = U();
      try {
        z(n)(a, i, s, u, c, m, f, d, y);
      } catch (D) {
        if (F(k), D !== D + 0) throw D;
        H(1, 0);
      }
    }
    function Zs(n, a, i, s, u, c, m) {
      var f = U();
      try {
        z(n)(a, i, s, u, c, m);
      } catch (d) {
        if (F(f), d !== d + 0) throw d;
        H(1, 0);
      }
    }
    function Os(n, a, i, s, u, c, m, f) {
      var d = U();
      try {
        z(n)(a, i, s, u, c, m, f);
      } catch (y) {
        if (F(d), y !== y + 0) throw y;
        H(1, 0);
      }
    }
    function eu(n, a, i, s, u, c, m, f, d, y, k, D) {
      var M = U();
      try {
        return z(n)(a, i, s, u, c, m, f, d, y, k, D);
      } catch (I) {
        if (F(M), I !== I + 0) throw I;
        H(1, 0);
      }
    }
    function tu(n, a, i, s, u, c) {
      var m = U();
      try {
        return z(n)(a, i, s, u, c);
      } catch (f) {
        if (F(m), f !== f + 0) throw f;
        H(1, 0);
      }
    }
    function nu(n, a, i, s, u, c, m, f, d) {
      var y = U();
      try {
        z(n)(a, i, s, u, c, m, f, d);
      } catch (k) {
        if (F(y), k !== k + 0) throw k;
        H(1, 0);
      }
    }
    function ru(n, a, i, s, u, c, m, f, d, y, k, D) {
      var M = U();
      try {
        z(n)(a, i, s, u, c, m, f, d, y, k, D);
      } catch (I) {
        if (F(M), I !== I + 0) throw I;
        H(1, 0);
      }
    }
    e.addFunction = Ds, e.setValue = $r, e.getValue = Fr, e.UTF8ToString = tt, e.stringToUTF8 = Xe, e.lengthBytesUTF8 = Be, e.FS = _;
    var Tt;
    Oe = function n() {
      Tt || or(), Tt || (Oe = n);
    };
    function or() {
      if (We > 0 || (Tr(), We > 0))
        return;
      function n() {
        Tt || (Tt = !0, e.calledRun = !0, !zt && (Rr(), o(e), e.onRuntimeInitialized && e.onRuntimeInitialized(), Cr()));
      }
      e.setStatus ? (e.setStatus("Running..."), setTimeout(function() {
        setTimeout(function() {
          e.setStatus("");
        }, 1), n();
      }, 1)) : n();
    }
    if (e.preInit)
      for (typeof e.preInit == "function" && (e.preInit = [e.preInit]); e.preInit.length > 0; )
        e.preInit.pop()();
    return or(), r.ready;
  };
})();
class Su {
  constructor(r) {
    if (r instanceof URL) {
      if (r.protocol !== "http:" && r.protocol !== "https:")
        throw new Error("Only http/https protocol is supported");
      this.locateFile = () => r.href;
    } else r instanceof WebAssembly.Module ? this.instantiateWasm = (e, o) => {
      const g = new WebAssembly.Instance(r, e);
      o(g);
    } : this.wasmBinary = r;
  }
  wasmBinary;
  instantiateWasm;
  locateFile;
}
class l {
  loader;
  api;
  /** @internal */
  constructor() {
    this.loader = (r, e) => new Promise((o, g) => {
      if (this.api !== void 0) {
        o();
        return;
      }
      const p = new Su(r);
      wu(p).then((h) => {
        try {
          this.writeConfigurationFiles(h, e), tn(h, "MAGICK_CONFIGURE_PATH", (S) => {
            tn(h, "/xml", (G) => {
              h._Environment_SetEnv(S, G), this.api = h, o();
            });
          });
        } catch (S) {
          g(S);
        }
      });
    });
  }
  /** @internal */
  async _initialize(r, e) {
    await this.loader(r, e);
  }
  /** @internal */
  static get _api() {
    if (!Wt.api)
      throw new Z("`await initializeImageMagick` should be called to initialize the library");
    return Wt.api;
  }
  /** @internal */
  static set _api(r) {
    Wt.api = r;
  }
  static read(r, e, o, g) {
    return ne._create((p) => {
      let h = g;
      if (typeof r != "string" && !fr(r))
        typeof e == "number" && typeof o == "number" && p.read(r, e, o);
      else if (typeof e != "number" && typeof o != "number") {
        h = o;
        let S;
        e instanceof Ie ? S = e : typeof e == "string" ? (S = new Ie(), S.format = e) : h = e, p.read(r, S);
      }
      return h(p);
    });
  }
  static readCollection(r, e, o) {
    return Me.create()._use((p) => {
      let h = o, S;
      return e instanceof Ie ? S = e : typeof e == "string" ? (S = new Ie(), S.format = e) : h = e, p.read(r, S), h(p);
    });
  }
  static readFromCanvas(r, e, o) {
    return ne._create((g) => (g.readFromCanvas(r, o), e(g)));
  }
  writeConfigurationFiles(r, e) {
    r.FS.analyzePath("/xml").exists || r.FS.mkdir("/xml");
    for (const g of e.all()) {
      const p = r.FS.open(`/xml/${g.fileName}`, "w"), h = new TextEncoder().encode(g.data);
      r.FS.write(p, h, 0, h.length), r.FS.close(p);
    }
  }
}
const Wt = new l();
async function uo(t, r) {
  await Wt._initialize(t, r ?? rn.default);
}
class ku {
  /** @internal */
  constructor(r, e, o) {
    this.origin = r, this.progress = new ie((e + 1) / (o * 100));
  }
  /**
   * Gets the originator of this event.
   */
  origin;
  /**
   * Gets the progress percentage.
   */
  progress;
  /**
   * Gets or sets a value indicating whether the current operation will be canceled.
   */
  cancel = !1;
}
class ae {
  static _logDelegate = 0;
  static _onLog;
  static _progressDelegate = 0;
  static _images = {};
  static setLogDelegate(r) {
    ae._logDelegate === 0 && r !== void 0 && (ae._logDelegate = l._api.addFunction(ae.logDelegate, "vii")), l._api._Magick_SetLogDelegate(r === void 0 ? 0 : ae._logDelegate), ae._onLog = r;
  }
  static setProgressDelegate(r) {
    ae._progressDelegate === 0 && (this._progressDelegate = l._api.addFunction(ae.progressDelegate, "iijji")), this._images[r._instance] = r, l._api._MagickImage_SetClientData(r._instance, r._instance), l._api._MagickImage_SetProgressDelegate(r._instance, ae._progressDelegate);
  }
  static removeProgressDelegate(r) {
    l._api._MagickImage_SetClientData(r._instance, 0), l._api._MagickImage_SetProgressDelegate(r._instance, 0), delete ae._images[r._instance];
  }
  static logDelegate(r, e) {
    if (ae._onLog === void 0)
      return;
    const o = ge(e);
    ae._onLog(new ou(r, o));
  }
  static progressDelegate(r, e, o, g) {
    const p = ae._images[g];
    if (p === void 0 || p.onProgress === void 0)
      return 1;
    const h = Number(e), S = Number(o), G = ge(r), C = new ku(G, h, S);
    return p.onProgress(C), C.cancel ? 0 : 1;
  }
}
class Te {
  static _allFormats;
  constructor(r, e, o, g, p) {
    this.format = r, this.description = e, this.supportsMultipleFrames = o, this.supportsReading = g, this.supportsWriting = p;
  }
  description;
  format;
  supportsMultipleFrames;
  supportsReading;
  supportsWriting;
  static get all() {
    return Te._allFormats === void 0 && (Te._allFormats = Te.loadFormats()), Te._allFormats;
  }
  static loadFormats() {
    return T.usePointer((r) => Ge.use((e) => {
      const o = l._api._MagickFormatInfo_CreateList(e.ptr, r), g = e.value;
      try {
        const p = new Array(g), h = Object.values(be);
        for (let S = 0; S < g; S++) {
          const G = l._api._MagickFormatInfo_GetInfo(o, S, r), C = ge(l._api._MagickFormatInfo_Format_Get(G)), x = Te.convertFormat(C, h), re = ge(l._api._MagickFormatInfo_Description_Get(G), ""), pe = l._api._MagickFormatInfo_SupportsMultipleFrames_Get(G) == 1, Pe = l._api._MagickFormatInfo_SupportsReading_Get(G) == 1, Re = l._api._MagickFormatInfo_SupportsWriting_Get(G) == 1;
          p[S] = new Te(x, re, pe, Pe, Re);
        }
        return p;
      } finally {
        l._api._MagickFormatInfo_DisposeList(o, g);
      }
    }));
  }
  static convertFormat(r, e) {
    return r === null ? be.Unknown : e.includes(r) ? r : be.Unknown;
  }
}
var Q = /* @__PURE__ */ ((t) => (t[t.None = 0] = "None", t[t.Accelerate = 1] = "Accelerate", t[t.Annotate = 2] = "Annotate", t[t.Blob = 4] = "Blob", t[t.Cache = 8] = "Cache", t[t.Coder = 16] = "Coder", t[t.Configure = 32] = "Configure", t[t.Deprecate = 64] = "Deprecate", t[t.Draw = 128] = "Draw", t[t.Exception = 256] = "Exception", t[t.Image = 512] = "Image", t[t.Locale = 1024] = "Locale", t[t.Module = 2048] = "Module", t[t.Pixel = 4096] = "Pixel", t[t.Policy = 8192] = "Policy", t[t.Resource = 16384] = "Resource", t[t.Trace = 32768] = "Trace", t[t.Transform = 65536] = "Transform", t[t.User = 131072] = "User", t[t.Wand = 262144] = "Wand", t[t.Detailed = 2147450879] = "Detailed", t[t.All = 2147483647] = "All", t))(Q || {});
class De {
  /**
   * Gets the ImageMagick delegate libraries.
   */
  static get delegates() {
    return ge(l._api._Magick_Delegates_Get());
  }
  /**
   * Gets the ImageMagick features.
   */
  static get features() {
    return ge(l._api._Magick_Features_Get()).slice(0, -1);
  }
  /**
   * Gets the ImageMagick version.
   */
  static get imageMagickVersion() {
    return ge(l._api._Magick_ImageMagickVersion_Get());
  }
  /**
   * Gets information about the supported formats.
   */
  static get supportedFormats() {
    return Te.all;
  }
  /**
   * Function that will be executed when something is logged by ImageMagick.
   */
  static onLog;
  /**
   * Registers a font.
   * @param name The name of the font.
   * @param data The byte array containing the font.
   */
  static addFont(r, e) {
    const o = l._api.FS;
    o.analyzePath("/fonts").exists || o.mkdir("/fonts");
    const p = o.open(`/fonts/${r}`, "w");
    o.write(p, e, 0, e.length), o.close(p);
  }
  /**
   * Sets the pseudo-random number generator secret key.
   * @param seed The secret key.
   */
  static setRandomSeed = (r) => l._api._Magick_SetRandomSeed(r);
  /**
   * Set the events that will be written to the log. The log will be written to the Log event
   * and the debug window in VisualStudio. To change the log settings you must use a custom
   * log.xml file.
   * @param eventTypes The events that should be logged.
   */
  static setLogEvents(r) {
    const e = r == Q.None ? void 0 : De.logDelegate;
    ae.setLogDelegate(e);
    const o = De.getEventTypeString(r);
    L(o, (g) => l._api._Magick_SetLogEvents(g));
  }
  /** @internal */
  static _getFontFileName(r) {
    const e = `/fonts/${r}`;
    if (!l._api.FS.analyzePath(e).exists)
      throw `Unable to find a font with the name '${r}', add it with Magick.addFont.`;
    return e;
  }
  static getEventTypeString(r) {
    if (r == Q.All)
      return "All,Trace";
    if (r == Q.Detailed)
      return "All";
    switch (r) {
      case Q.Accelerate:
        return "Accelerate";
      case Q.Annotate:
        return "Annotate";
      case Q.Blob:
        return "Blob";
      case Q.Cache:
        return "Cache";
      case Q.Coder:
        return "Coder";
      case Q.Configure:
        return "Configure";
      case Q.Deprecate:
        return "Deprecate";
      case Q.Draw:
        return "Draw";
      case Q.Exception:
        return "Exception";
      case Q.Image:
        return "Image";
      case Q.Locale:
        return "Locale";
      case Q.Module:
        return "Module";
      case Q.Pixel:
        return "Pixel";
      case Q.Policy:
        return "Policy";
      case Q.Resource:
        return "Resource";
      case Q.Trace:
        return "Trace";
      case Q.Transform:
        return "Transform";
      case Q.User:
        return "User";
      case Q.Wand:
        return "Wand";
      case Q.None:
      default:
        return "None";
    }
  }
  static logDelegate(r) {
    De.onLog !== void 0 && De.onLog(r);
  }
}
class vu {
  _font;
  /**
   * Initializes a new instance of the {@link DrawableFont} class.
   * @param opacity The name of the font that was registered.
   */
  constructor(r) {
    this._font = r;
  }
  draw(r) {
    const e = De._getFontFileName(this._font);
    r.font(e);
  }
}
class Mu {
  _gravity;
  /**
   * Initializes a new instance of the {@link DrawableGravity} class.
   * @param gravity The gravity to use.
   */
  constructor(r) {
    this._gravity = r;
  }
  draw(r) {
    r.gravity(this._gravity);
  }
}
class Iu {
  _startX;
  _startY;
  _endX;
  _endY;
  /**
   * Initializes a new instance of the {@link DrawableLine} class.
   * @param startX The starting X coordinate.
   * @param startY The starting Y coordinate.
   * @param endX The ending X coordinate.
   * @param endY The ending Y coordinate.
   */
  constructor(r, e, o, g) {
    this._startX = r, this._startY = e, this._endX = o, this._endY = g;
  }
  draw(r) {
    r.line(this._startX, this._startY, this._endX, this._endY);
  }
}
class Du {
  _x;
  _y;
  /**
   * Initializes a new instance of the {@link DrawablePoint} class.
   * @param x The X coordinate.
   * @param y The Y coordinate.
   */
  constructor(r, e) {
    this._x = r, this._y = e;
  }
  draw(r) {
    r.point(this._x, this._y);
  }
}
class Gu {
  _upperLeftX;
  _upperLeftY;
  _lowerRightX;
  _lowerRightY;
  /**
    * Initializes a new instance of the {@link DrawablePoint} class.
    * @param upperLeftX The upper left X coordinate.
    * @param upperLeftY The upper left Y coordinate.
    * @param lowerRightX The lower right X coordinate.
    * @param lowerRightY The lower right Y coordinate.
    */
  constructor(r, e, o, g) {
    this._upperLeftX = r, this._upperLeftY = e, this._lowerRightX = o, this._lowerRightY = g;
  }
  draw(r) {
    r.rectangle(this._upperLeftX, this._upperLeftY, this._lowerRightX, this._lowerRightY);
  }
}
class bu {
  _upperLeftX;
  _upperLeftY;
  _lowerRightX;
  _lowerRightY;
  _cornerWidth;
  _cornerHeight;
  /**
   * Initializes a new instance of the {@link DrawableRoundRectangle} class.
   * @param upperLeftX The upper left X coordinate.
   * @param upperLeftY The upper left Y coordinate.
   * @param lowerRightX The lower right X coordinate.
   * @param lowerRightY The lower right Y coordinate.
   * @param cornerWidth The corner width.
   * @param cornerHeight The corner height.
   */
  constructor(r, e, o, g, p, h) {
    this._upperLeftX = r, this._upperLeftY = e, this._lowerRightX = o, this._lowerRightY = g, this._cornerWidth = p, this._cornerHeight = h;
  }
  draw(r) {
    r.roundRectangle(this._upperLeftX, this._upperLeftY, this._lowerRightX, this._lowerRightY, this._cornerWidth, this._cornerHeight);
  }
}
class Pu {
  _color;
  /**
   * Initializes a new instance of the {@link DrawableStrokeColor} class.
   * @param color The color to use.
   */
  constructor(r) {
    this._color = r;
  }
  draw(r) {
    r.strokeColor(this._color);
  }
}
class Au {
  _width;
  /**
   * Initializes a new instance of the {@link DrawableStrokeWidth} class.
   * @param width The width.
   */
  constructor(r) {
    this._width = r;
  }
  draw(r) {
    r.strokeWidth(this._width);
  }
}
class Eu {
  _alignment;
  /**
   * Initializes a new instance of the {@link DrawableFillColor} class.
   * @param alignment The text alignment
   */
  constructor(r) {
    this._alignment = r;
  }
  draw(r) {
    r.textAlignment(this._alignment);
  }
}
class pt {
  _isEnabled;
  constructor(r) {
    this._isEnabled = r;
  }
  /**
   * Initializes a new instance of the {@link DrawableTextAntialias} class with antialias disabled.
   */
  static get disabled() {
    return new pt(!1);
  }
  /**
   * Initializes a new instance of the {@link DrawableTextAntialias} class with antialias enabled.
   */
  static get enabled() {
    return new pt(!0);
  }
  draw(r) {
    r.textAntialias(this._isEnabled);
  }
}
class Tu {
  _decoration;
  /**
   * Initializes a new instance of the {@link DrawableTextDecoration} class.
   * @param decoration The text decoration.
   */
  constructor(r) {
    this._decoration = r;
  }
  draw(r) {
    r.textDecoration(this._decoration);
  }
}
class Ru {
  _spacing;
  /**
   * Initializes a new instance of the {@link DrawableTextInterlineSpacing} class.
   * @param decoration The spacing to use.
   */
  constructor(r) {
    this._spacing = r;
  }
  draw(r) {
    r.textInterlineSpacing(this._spacing);
  }
}
class Cu {
  _spacing;
  /**
   * Initializes a new instance of the {@link DrawableTextInterwordSpacing} class.
   * @param decoration The spacing to use.
   */
  constructor(r) {
    this._spacing = r;
  }
  draw(r) {
    r.textInterwordspacing(this._spacing);
  }
}
class Wu {
  _kerning;
  /**
   * Initializes a new instance of the {@link DrawableTextKerning} class.
   * @param kerning The kerning to use.
   */
  constructor(r) {
    this._kerning = r;
  }
  draw(r) {
    r.textKerning(this._kerning);
  }
}
class Bu {
  _color;
  /**
   * Initializes a new instance of the {@link DrawableTextUnderColor} class.
   * @param decoration The color to use.
   */
  constructor(r) {
    this._color = r;
  }
  draw(r) {
    r.textUnderColor(this._color);
  }
}
class Lu {
  _x;
  _y;
  _value;
  /**
   * Initializes a new instance of the {@link DrawableTextUnderColor} class.
   * @param x The X coordinate.
   * @param y The Y coordinate.
   * @param value The text to draw.
   */
  constructor(r, e, o) {
    this._x = r, this._y = e, this._value = o;
  }
  draw(r) {
    r.text(this._x, this._y, this._value);
  }
}
class xu {
  /**
   * Gets a system-defined color that has an RGBA value of #00000000.
  */
  static get None() {
    return new w(0, 0, 0, 0);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #00000000.
  */
  static get Transparent() {
    return new w(0, 0, 0, 0);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #F0F8FFFF.
  */
  static get AliceBlue() {
    return new w(240, 248, 255, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #FAEBD7FF.
  */
  static get AntiqueWhite() {
    return new w(250, 235, 215, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #00FFFFFF.
  */
  static get Aqua() {
    return new w(0, 255, 255, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #7FFFD4FF.
  */
  static get Aquamarine() {
    return new w(127, 255, 212, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #F0FFFFFF.
  */
  static get Azure() {
    return new w(240, 255, 255, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #F5F5DCFF.
  */
  static get Beige() {
    return new w(245, 245, 220, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #FFE4C4FF.
  */
  static get Bisque() {
    return new w(255, 228, 196, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #000000FF.
  */
  static get Black() {
    return new w(0, 0, 0, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #FFEBCDFF.
  */
  static get BlanchedAlmond() {
    return new w(255, 235, 205, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #0000FFFF.
  */
  static get Blue() {
    return new w(0, 0, 255, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #8A2BE2FF.
  */
  static get BlueViolet() {
    return new w(138, 43, 226, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #A52A2AFF.
  */
  static get Brown() {
    return new w(165, 42, 42, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #DEB887FF.
  */
  static get BurlyWood() {
    return new w(222, 184, 135, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #5F9EA0FF.
  */
  static get CadetBlue() {
    return new w(95, 158, 160, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #7FFF00FF.
  */
  static get Chartreuse() {
    return new w(127, 255, 0, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #D2691EFF.
  */
  static get Chocolate() {
    return new w(210, 105, 30, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #FF7F50FF.
  */
  static get Coral() {
    return new w(255, 127, 80, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #6495EDFF.
  */
  static get CornflowerBlue() {
    return new w(100, 149, 237, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #FFF8DCFF.
  */
  static get Cornsilk() {
    return new w(255, 248, 220, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #DC143CFF.
  */
  static get Crimson() {
    return new w(220, 20, 60, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #00FFFFFF.
  */
  static get Cyan() {
    return new w(0, 255, 255, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #00008BFF.
  */
  static get DarkBlue() {
    return new w(0, 0, 139, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #008B8BFF.
  */
  static get DarkCyan() {
    return new w(0, 139, 139, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #B8860BFF.
  */
  static get DarkGoldenrod() {
    return new w(184, 134, 11, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #A9A9A9FF.
  */
  static get DarkGray() {
    return new w(169, 169, 169, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #006400FF.
  */
  static get DarkGreen() {
    return new w(0, 100, 0, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #BDB76BFF.
  */
  static get DarkKhaki() {
    return new w(189, 183, 107, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #8B008BFF.
  */
  static get DarkMagenta() {
    return new w(139, 0, 139, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #556B2FFF.
  */
  static get DarkOliveGreen() {
    return new w(85, 107, 47, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #FF8C00FF.
  */
  static get DarkOrange() {
    return new w(255, 140, 0, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #9932CCFF.
  */
  static get DarkOrchid() {
    return new w(153, 50, 204, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #8B0000FF.
  */
  static get DarkRed() {
    return new w(139, 0, 0, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #E9967AFF.
  */
  static get DarkSalmon() {
    return new w(233, 150, 122, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #8FBC8FFF.
  */
  static get DarkSeaGreen() {
    return new w(143, 188, 143, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #483D8BFF.
  */
  static get DarkSlateBlue() {
    return new w(72, 61, 139, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #2F4F4FFF.
  */
  static get DarkSlateGray() {
    return new w(47, 79, 79, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #00CED1FF.
  */
  static get DarkTurquoise() {
    return new w(0, 206, 209, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #9400D3FF.
  */
  static get DarkViolet() {
    return new w(148, 0, 211, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #FF1493FF.
  */
  static get DeepPink() {
    return new w(255, 20, 147, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #00BFFFFF.
  */
  static get DeepSkyBlue() {
    return new w(0, 191, 255, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #696969FF.
  */
  static get DimGray() {
    return new w(105, 105, 105, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #1E90FFFF.
  */
  static get DodgerBlue() {
    return new w(30, 144, 255, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #B22222FF.
  */
  static get Firebrick() {
    return new w(178, 34, 34, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #FFFAF0FF.
  */
  static get FloralWhite() {
    return new w(255, 250, 240, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #228B22FF.
  */
  static get ForestGreen() {
    return new w(34, 139, 34, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #FF00FFFF.
  */
  static get Fuchsia() {
    return new w(255, 0, 255, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #DCDCDCFF.
  */
  static get Gainsboro() {
    return new w(220, 220, 220, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #F8F8FFFF.
  */
  static get GhostWhite() {
    return new w(248, 248, 255, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #FFD700FF.
  */
  static get Gold() {
    return new w(255, 215, 0, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #DAA520FF.
  */
  static get Goldenrod() {
    return new w(218, 165, 32, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #808080FF.
  */
  static get Gray() {
    return new w(128, 128, 128, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #008000FF.
  */
  static get Green() {
    return new w(0, 128, 0, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #ADFF2FFF.
  */
  static get GreenYellow() {
    return new w(173, 255, 47, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #F0FFF0FF.
  */
  static get Honeydew() {
    return new w(240, 255, 240, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #FF69B4FF.
  */
  static get HotPink() {
    return new w(255, 105, 180, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #CD5C5CFF.
  */
  static get IndianRed() {
    return new w(205, 92, 92, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #4B0082FF.
  */
  static get Indigo() {
    return new w(75, 0, 130, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #FFFFF0FF.
  */
  static get Ivory() {
    return new w(255, 255, 240, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #F0E68CFF.
  */
  static get Khaki() {
    return new w(240, 230, 140, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #E6E6FAFF.
  */
  static get Lavender() {
    return new w(230, 230, 250, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #FFF0F5FF.
  */
  static get LavenderBlush() {
    return new w(255, 240, 245, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #7CFC00FF.
  */
  static get LawnGreen() {
    return new w(124, 252, 0, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #FFFACDFF.
  */
  static get LemonChiffon() {
    return new w(255, 250, 205, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #ADD8E6FF.
  */
  static get LightBlue() {
    return new w(173, 216, 230, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #F08080FF.
  */
  static get LightCoral() {
    return new w(240, 128, 128, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #E0FFFFFF.
  */
  static get LightCyan() {
    return new w(224, 255, 255, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #FAFAD2FF.
  */
  static get LightGoldenrodYellow() {
    return new w(250, 250, 210, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #90EE90FF.
  */
  static get LightGreen() {
    return new w(144, 238, 144, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #D3D3D3FF.
  */
  static get LightGray() {
    return new w(211, 211, 211, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #FFB6C1FF.
  */
  static get LightPink() {
    return new w(255, 182, 193, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #FFA07AFF.
  */
  static get LightSalmon() {
    return new w(255, 160, 122, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #20B2AAFF.
  */
  static get LightSeaGreen() {
    return new w(32, 178, 170, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #87CEFAFF.
  */
  static get LightSkyBlue() {
    return new w(135, 206, 250, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #778899FF.
  */
  static get LightSlateGray() {
    return new w(119, 136, 153, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #B0C4DEFF.
  */
  static get LightSteelBlue() {
    return new w(176, 196, 222, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #FFFFE0FF.
  */
  static get LightYellow() {
    return new w(255, 255, 224, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #00FF00FF.
  */
  static get Lime() {
    return new w(0, 255, 0, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #32CD32FF.
  */
  static get LimeGreen() {
    return new w(50, 205, 50, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #FAF0E6FF.
  */
  static get Linen() {
    return new w(250, 240, 230, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #FF00FFFF.
  */
  static get Magenta() {
    return new w(255, 0, 255, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #800000FF.
  */
  static get Maroon() {
    return new w(128, 0, 0, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #66CDAAFF.
  */
  static get MediumAquamarine() {
    return new w(102, 205, 170, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #0000CDFF.
  */
  static get MediumBlue() {
    return new w(0, 0, 205, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #BA55D3FF.
  */
  static get MediumOrchid() {
    return new w(186, 85, 211, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #9370DBFF.
  */
  static get MediumPurple() {
    return new w(147, 112, 219, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #3CB371FF.
  */
  static get MediumSeaGreen() {
    return new w(60, 179, 113, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #7B68EEFF.
  */
  static get MediumSlateBlue() {
    return new w(123, 104, 238, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #00FA9AFF.
  */
  static get MediumSpringGreen() {
    return new w(0, 250, 154, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #48D1CCFF.
  */
  static get MediumTurquoise() {
    return new w(72, 209, 204, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #C71585FF.
  */
  static get MediumVioletRed() {
    return new w(199, 21, 133, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #191970FF.
  */
  static get MidnightBlue() {
    return new w(25, 25, 112, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #F5FFFAFF.
  */
  static get MintCream() {
    return new w(245, 255, 250, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #FFE4E1FF.
  */
  static get MistyRose() {
    return new w(255, 228, 225, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #FFE4B5FF.
  */
  static get Moccasin() {
    return new w(255, 228, 181, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #FFDEADFF.
  */
  static get NavajoWhite() {
    return new w(255, 222, 173, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #000080FF.
  */
  static get Navy() {
    return new w(0, 0, 128, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #FDF5E6FF.
  */
  static get OldLace() {
    return new w(253, 245, 230, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #808000FF.
  */
  static get Olive() {
    return new w(128, 128, 0, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #6B8E23FF.
  */
  static get OliveDrab() {
    return new w(107, 142, 35, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #FFA500FF.
  */
  static get Orange() {
    return new w(255, 165, 0, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #FF4500FF.
  */
  static get OrangeRed() {
    return new w(255, 69, 0, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #DA70D6FF.
  */
  static get Orchid() {
    return new w(218, 112, 214, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #EEE8AAFF.
  */
  static get PaleGoldenrod() {
    return new w(238, 232, 170, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #98FB98FF.
  */
  static get PaleGreen() {
    return new w(152, 251, 152, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #AFEEEEFF.
  */
  static get PaleTurquoise() {
    return new w(175, 238, 238, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #DB7093FF.
  */
  static get PaleVioletRed() {
    return new w(219, 112, 147, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #FFEFD5FF.
  */
  static get PapayaWhip() {
    return new w(255, 239, 213, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #FFDAB9FF.
  */
  static get PeachPuff() {
    return new w(255, 218, 185, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #CD853FFF.
  */
  static get Peru() {
    return new w(205, 133, 63, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #FFC0CBFF.
  */
  static get Pink() {
    return new w(255, 192, 203, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #DDA0DDFF.
  */
  static get Plum() {
    return new w(221, 160, 221, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #B0E0E6FF.
  */
  static get PowderBlue() {
    return new w(176, 224, 230, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #800080FF.
  */
  static get Purple() {
    return new w(128, 0, 128, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #663399FF.
  */
  static get RebeccaPurple() {
    return new w(102, 51, 153, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #FF0000FF.
  */
  static get Red() {
    return new w(255, 0, 0, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #BC8F8FFF.
  */
  static get RosyBrown() {
    return new w(188, 143, 143, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #4169E1FF.
  */
  static get RoyalBlue() {
    return new w(65, 105, 225, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #8B4513FF.
  */
  static get SaddleBrown() {
    return new w(139, 69, 19, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #FA8072FF.
  */
  static get Salmon() {
    return new w(250, 128, 114, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #F4A460FF.
  */
  static get SandyBrown() {
    return new w(244, 164, 96, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #2E8B57FF.
  */
  static get SeaGreen() {
    return new w(46, 139, 87, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #FFF5EEFF.
  */
  static get SeaShell() {
    return new w(255, 245, 238, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #A0522DFF.
  */
  static get Sienna() {
    return new w(160, 82, 45, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #C0C0C0FF.
  */
  static get Silver() {
    return new w(192, 192, 192, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #87CEEBFF.
  */
  static get SkyBlue() {
    return new w(135, 206, 235, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #6A5ACDFF.
  */
  static get SlateBlue() {
    return new w(106, 90, 205, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #708090FF.
  */
  static get SlateGray() {
    return new w(112, 128, 144, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #FFFAFAFF.
  */
  static get Snow() {
    return new w(255, 250, 250, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #00FF7FFF.
  */
  static get SpringGreen() {
    return new w(0, 255, 127, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #4682B4FF.
  */
  static get SteelBlue() {
    return new w(70, 130, 180, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #D2B48CFF.
  */
  static get Tan() {
    return new w(210, 180, 140, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #008080FF.
  */
  static get Teal() {
    return new w(0, 128, 128, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #D8BFD8FF.
  */
  static get Thistle() {
    return new w(216, 191, 216, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #FF6347FF.
  */
  static get Tomato() {
    return new w(255, 99, 71, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #40E0D0FF.
  */
  static get Turquoise() {
    return new w(64, 224, 208, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #EE82EEFF.
  */
  static get Violet() {
    return new w(238, 130, 238, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #F5DEB3FF.
  */
  static get Wheat() {
    return new w(245, 222, 179, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #FFFFFFFF.
  */
  static get White() {
    return new w(255, 255, 255, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #F5F5F5FF.
  */
  static get WhiteSmoke() {
    return new w(245, 245, 245, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #FFFF00FF.
  */
  static get Yellow() {
    return new w(255, 255, 0, 255);
  }
  /**
   * Gets a system-defined color that has an RGBA value of #9ACD32FF.
  */
  static get YellowGreen() {
    return new w(154, 205, 50, 255);
  }
}
class oo {
  _drawables = [];
  /**
   * Adds {@link DrawableTextAntialias.enabled} to the drawables.
   */
  disableStrokeAntialias() {
    return this._drawables.push(pt.disabled), this;
  }
  /**
   * Adds {@link DrawableTextAntialias.enabled} to the drawables.
   */
  enableStrokeAntialias() {
    return this._drawables.push(pt.enabled), this;
  }
  /**
   * Adds a {@link DrawableFillColor} to the drawables.
   * @param color The color to use.
   */
  fillColor(r) {
    return this._drawables.push(new iu(r)), this;
  }
  /**
   * Adds a {@link DrawableFillOpacity} to the drawables.
   * @param opacity The opacity.
   */
  fillOpacity(r) {
    return this._drawables.push(new su(r)), this;
  }
  /**
   * Adds a {@link DrawableFont} to the drawables.
   * @param font The name of the font that was registered.
   */
  font(r) {
    return this._drawables.push(new vu(r)), this;
  }
  /**
   * Adds a {@link DrawableFontPointSize} to the drawables.
   * @param pointSize The point size.
   */
  fontPointSize(r) {
    return this._drawables.push(new uu(r)), this;
  }
  /**
   * Obtain font metrics for text string given current font, pointsize, and density settings.
   * @param text The text to get the metrics for.
   * @param ignoreNewlines A value indicating whether newlines should be ignored.
   */
  fontTypeMetrics(r, e = !1) {
    return ne._create((o) => (o.read(xu.Transparent, 1, 1), Lt._use(o, (g) => (g.draw(this._drawables), g.fontTypeMetrics(r, e)))));
  }
  /**
   * Adds a {@link DrawableGravity} to the drawables.
   * @param value The gravity to use.
   */
  gravity(r) {
    return this._drawables.push(new Mu(r)), this;
  }
  /**
   * Adds a {@link DrawableLine} to the drawables.
   * @param startX The starting X coordinate.
   * @param startY The starting Y coordinate.
   * @param endX The ending X coordinate.
   * @param endY The ending Y coordinate.
   */
  line(r, e, o, g) {
    return this._drawables.push(new Iu(r, e, o, g)), this;
  }
  /**
   * Adds a {@link DrawablePoint} to the drawables.
   * @param x The X coordinate.
   * @param y The Y coordinate.
   */
  point(r, e) {
    return this._drawables.push(new Du(r, e)), this;
  }
  /**
   * Adds a {@link DrawableRectangle} to the drawables.
   * @param upperLeftX The upper left X coordinate.
   * @param upperLeftY The upper left Y coordinate.
   * @param lowerRightX The lower right X coordinate.
   * @param lowerRightY The lower right Y coordinate.
   */
  rectangle(r, e, o, g) {
    return this._drawables.push(new Gu(r, e, o, g)), this;
  }
  /**
   * Adds a {@link DrawableRoundRectangle} to the drawables.
   * @param upperLeftX The upper left X coordinate.
   * @param upperLeftY The upper left Y coordinate.
   * @param lowerRightX The lower right X coordinate.
   * @param lowerRightY The lower right Y coordinate.
   * @param cornerWidth The corner width.
   * @param cornerHeight The corner height.
   */
  roundRectangle(r, e, o, g, p, h) {
    return this._drawables.push(new bu(r, e, o, g, p, h)), this;
  }
  /**
   * Adds a {@link DrawableStrokeColor} to the drawables.
   * @param color The color to use.
   */
  strokeColor(r) {
    return this._drawables.push(new Pu(r)), this;
  }
  /**
   * Adds a {@link DrawableStrokeWidth} to the drawables.
   * @param width The width.
   */
  strokeWidth(r) {
    return this._drawables.push(new Au(r)), this;
  }
  /**
   * Adds a {@link DrawableText} to the drawables.
   * @param x The X coordinate.
   * @param y The Y coordinate.
   * @param value The text to draw.
   */
  text(r, e, o) {
    return this._drawables.push(new Lu(r, e, o)), this;
  }
  /**
   * Adds a {@link DrawableTextAlignment} to the drawables.
   * @param alignment The text alignment.
   */
  textAlignment(r) {
    return this._drawables.push(new Eu(r)), this;
  }
  /**
   * Adds a {@link DrawableTextDecoration} to the drawables.
   * @param decoration The text decoration.
   */
  textDecoration(r) {
    return this._drawables.push(new Tu(r)), this;
  }
  /**
   * Adds a {@link DrawableTextInterlineSpacing} to the drawables.
   * @param spacing The spacing to use.
   */
  textInterlineSpacing(r) {
    return this._drawables.push(new Ru(r)), this;
  }
  /**
   * Adds a {@link DrawableTextInterlineSpacing} to the drawables.
   * @param spacing The spacing to use.
   */
  textInterwordSpacing(r) {
    return this._drawables.push(new Cu(r)), this;
  }
  /**
   * Adds a {@link DrawableTextKerning} to the drawables.
   * @param kerning The kerning to use.
   */
  textKerning(r) {
    return this._drawables.push(new Wu(r)), this;
  }
  /**
   * Adds a {@link DrawableTextUnderColor} to the drawables.
   * @param color The color to use.
   */
  textUnderColor(r) {
    return this._drawables.push(new Bu(r)), this;
  }
  /**
   * Draw on the specified image.
   * @param image The image to draw on.
   */
  draw(r) {
    return r.draw(this._drawables), this;
  }
}
var zu = /* @__PURE__ */ ((t) => (t[t.Undefined = 0] = "Undefined", t[t.Kapur = 1] = "Kapur", t[t.OTSU = 2] = "OTSU", t[t.Triangle = 3] = "Triangle", t))(zu || {}), Nu = /* @__PURE__ */ ((t) => (t[t.Undefined = 0] = "Undefined", t[t.Direct = 1] = "Direct", t[t.Pseudo = 2] = "Pseudo", t))(Nu || {}), Hu = /* @__PURE__ */ ((t) => (t[t.Undefined = 0] = "Undefined", t[t.Bilevel = 1] = "Bilevel", t[t.Grayscale = 2] = "Grayscale", t[t.GrayscaleAlpha = 3] = "GrayscaleAlpha", t[t.Palette = 4] = "Palette", t[t.PaletteAlpha = 5] = "PaletteAlpha", t[t.TrueColor = 6] = "TrueColor", t[t.TrueColorAlpha = 7] = "TrueColorAlpha", t[t.ColorSeparation = 8] = "ColorSeparation", t[t.ColorSeparationAlpha = 9] = "ColorSeparationAlpha", t[t.Optimize = 10] = "Optimize", t[t.PaletteBilevelAlpha = 11] = "PaletteBilevelAlpha", t))(Hu || {}), Uu = /* @__PURE__ */ ((t) => (t[t.Undefined = 0] = "Undefined", t[t.Add = 1] = "Add", t[t.Conjugate = 2] = "Conjugate", t[t.Divide = 3] = "Divide", t[t.MagnitudePhase = 4] = "MagnitudePhase", t[t.Multiply = 5] = "Multiply", t[t.RealImaginary = 6] = "RealImaginary", t[t.Subtract = 7] = "Subtract", t))(Uu || {}), Mr = /* @__PURE__ */ ((t) => (t[t.Undefined = 0] = "Undefined", t[t.B44A = 1] = "B44A", t[t.B44 = 2] = "B44", t[t.BZip = 3] = "BZip", t[t.DXT1 = 4] = "DXT1", t[t.DXT3 = 5] = "DXT3", t[t.DXT5 = 6] = "DXT5", t[t.Fax = 7] = "Fax", t[t.Group4 = 8] = "Group4", t[t.JBIG1 = 9] = "JBIG1", t[t.JBIG2 = 10] = "JBIG2", t[t.JPEG2000 = 11] = "JPEG2000", t[t.JPEG = 12] = "JPEG", t[t.LosslessJPEG = 13] = "LosslessJPEG", t[t.LZMA = 14] = "LZMA", t[t.LZW = 15] = "LZW", t[t.NoCompression = 16] = "NoCompression", t[t.Piz = 17] = "Piz", t[t.Pxr24 = 18] = "Pxr24", t[t.RLE = 19] = "RLE", t[t.Zip = 20] = "Zip", t[t.ZipS = 21] = "ZipS", t[t.Zstd = 22] = "Zstd", t[t.WebP = 23] = "WebP", t[t.DWAA = 24] = "DWAA", t[t.DWAB = 25] = "DWAB", t[t.BC7 = 26] = "BC7", t[t.BC5 = 27] = "BC5", t))(Mr || {}), Fu = /* @__PURE__ */ ((t) => (t[t.Undefined = 0] = "Undefined", t[t.Affine = 1] = "Affine", t[t.AffineProjection = 2] = "AffineProjection", t[t.ScaleRotateTranslate = 3] = "ScaleRotateTranslate", t[t.Perspective = 4] = "Perspective", t[t.PerspectiveProjection = 5] = "PerspectiveProjection", t[t.BilinearForward = 6] = "BilinearForward", t[t.BilinearReverse = 7] = "BilinearReverse", t[t.Polynomial = 8] = "Polynomial", t[t.Arc = 9] = "Arc", t[t.Polar = 10] = "Polar", t[t.DePolar = 11] = "DePolar", t[t.Cylinder2Plane = 12] = "Cylinder2Plane", t[t.Plane2Cylinder = 13] = "Plane2Cylinder", t[t.Barrel = 14] = "Barrel", t[t.BarrelInverse = 15] = "BarrelInverse", t[t.Shepards = 16] = "Shepards", t[t.Resize = 17] = "Resize", t[t.Sentinel = 18] = "Sentinel", t[t.RigidAffine = 19] = "RigidAffine", t))(Fu || {}), $u = /* @__PURE__ */ ((t) => (t[t.Undefined = 0] = "Undefined", t[t.LSB = 1] = "LSB", t[t.MSB = 2] = "MSB", t))($u || {}), Yu = /* @__PURE__ */ ((t) => (t[t.Undefined = 0] = "Undefined", t[t.Absolute = 1] = "Absolute", t[t.Fuzz = 2] = "Fuzz", t[t.MeanAbsolute = 3] = "MeanAbsolute", t[t.MeanErrorPerPixel = 4] = "MeanErrorPerPixel", t[t.MeanSquared = 5] = "MeanSquared", t[t.NormalizedCrossCorrelation = 6] = "NormalizedCrossCorrelation", t[t.PeakAbsolute = 7] = "PeakAbsolute", t[t.PeakSignalToNoiseRatio = 8] = "PeakSignalToNoiseRatio", t[t.PerceptualHash = 9] = "PerceptualHash", t[t.RootMeanSquared = 10] = "RootMeanSquared", t[t.StructuralSimilarity = 11] = "StructuralSimilarity", t[t.StructuralDissimilarity = 12] = "StructuralDissimilarity", t))(Yu || {}), ju = /* @__PURE__ */ ((t) => (t[t.Undefined = 0] = "Undefined", t[t.Abs = 1] = "Abs", t[t.Add = 2] = "Add", t[t.AddModulus = 3] = "AddModulus", t[t.And = 4] = "And", t[t.Cosine = 5] = "Cosine", t[t.Divide = 6] = "Divide", t[t.Exponential = 7] = "Exponential", t[t.GaussianNoise = 8] = "GaussianNoise", t[t.ImpulseNoise = 9] = "ImpulseNoise", t[t.LaplacianNoise = 10] = "LaplacianNoise", t[t.LeftShift = 11] = "LeftShift", t[t.Log = 12] = "Log", t[t.Max = 13] = "Max", t[t.Mean = 14] = "Mean", t[t.Median = 15] = "Median", t[t.Min = 16] = "Min", t[t.MultiplicativeNoise = 17] = "MultiplicativeNoise", t[t.Multiply = 18] = "Multiply", t[t.Or = 19] = "Or", t[t.PoissonNoise = 20] = "PoissonNoise", t[t.Pow = 21] = "Pow", t[t.RightShift = 22] = "RightShift", t[t.RootMeanSquare = 23] = "RootMeanSquare", t[t.Set = 24] = "Set", t[t.Sine = 25] = "Sine", t[t.Subtract = 26] = "Subtract", t[t.Sum = 27] = "Sum", t[t.ThresholdBlack = 28] = "ThresholdBlack", t[t.Threshold = 29] = "Threshold", t[t.ThresholdWhite = 30] = "ThresholdWhite", t[t.UniformNoise = 31] = "UniformNoise", t[t.Xor = 32] = "Xor", t[t.InverseLog = 33] = "InverseLog", t))(ju || {}), Xu = /* @__PURE__ */ ((t) => (t[t.Undefined = 0] = "Undefined", t[t.Point = 1] = "Point", t[t.Box = 2] = "Box", t[t.Triangle = 3] = "Triangle", t[t.Hermite = 4] = "Hermite", t[t.Hann = 5] = "Hann", t[t.Hamming = 6] = "Hamming", t[t.Blackman = 7] = "Blackman", t[t.Gaussian = 8] = "Gaussian", t[t.Quadratic = 9] = "Quadratic", t[t.Cubic = 10] = "Cubic", t[t.Catrom = 11] = "Catrom", t[t.Mitchell = 12] = "Mitchell", t[t.Jinc = 13] = "Jinc", t[t.Sinc = 14] = "Sinc", t[t.SincFast = 15] = "SincFast", t[t.Kaiser = 16] = "Kaiser", t[t.Welch = 17] = "Welch", t[t.Parzen = 18] = "Parzen", t[t.Bohman = 19] = "Bohman", t[t.Bartlett = 20] = "Bartlett", t[t.Lagrange = 21] = "Lagrange", t[t.Lanczos = 22] = "Lanczos", t[t.LanczosSharp = 23] = "LanczosSharp", t[t.Lanczos2 = 24] = "Lanczos2", t[t.Lanczos2Sharp = 25] = "Lanczos2Sharp", t[t.Robidoux = 26] = "Robidoux", t[t.RobidouxSharp = 27] = "RobidouxSharp", t[t.Cosine = 28] = "Cosine", t[t.Spline = 29] = "Spline", t[t.LanczosRadius = 30] = "LanczosRadius", t[t.CubicSpline = 31] = "CubicSpline", t))(Xu || {}), Vu = /* @__PURE__ */ ((t) => (t[t.Undefined = 0] = "Undefined", t[t.None = 1] = "None", t[t.Background = 2] = "Background", t[t.Previous = 3] = "Previous", t))(Vu || {}), Ir = /* @__PURE__ */ ((t) => (t[t.Undefined = 0] = "Undefined", t[t.NoInterlace = 1] = "NoInterlace", t[t.Line = 2] = "Line", t[t.Plane = 3] = "Plane", t[t.Partition = 4] = "Partition", t[t.Gif = 5] = "Gif", t[t.Jpeg = 6] = "Jpeg", t[t.Png = 7] = "Png", t))(Ir || {}), qu = /* @__PURE__ */ ((t) => (t.Undefined = "Undefined", t.Unity = "Unity", t.Gaussian = "Gaussian", t.DoG = "DoG", t.LoG = "LoG", t.Blur = "Blur", t.Comet = "Comet", t.Binomial = "Binomial", t.Laplacian = "Laplacian", t.Sobel = "Sobel", t.FreiChen = "FreiChen", t.Roberts = "Roberts", t.Prewitt = "Prewitt", t.Compass = "Compass", t.Kirsch = "Kirsch", t.Diamond = "Diamond", t.Square = "Square", t.Rectangle = "Rectangle", t.Octagon = "Octagon", t.Disk = "Disk", t.Plus = "Plus", t.Cross = "Cross", t.Ring = "Ring", t.Peaks = "Peaks", t.Edges = "Edges", t.Corners = "Corners", t.Diagonals = "Diagonals", t.LineEnds = "LineEnds", t.LineJunctions = "LineJunctions", t.Ridges = "Ridges", t.ConvexHull = "ConvexHull", t.ThinSE = "ThinSE", t.Skeleton = "Skeleton", t.Chebyshev = "Chebyshev", t.Manhattan = "Manhattan", t.Octagonal = "Octagonal", t.Euclidean = "Euclidean", t.UserDefined = "UserDefined", t))(qu || {}), Qu = /* @__PURE__ */ ((t) => (t[t.Undefined = 0] = "Undefined", t[t.Convolve = 1] = "Convolve", t[t.Correlate = 2] = "Correlate", t[t.Erode = 3] = "Erode", t[t.Dilate = 4] = "Dilate", t[t.ErodeIntensity = 5] = "ErodeIntensity", t[t.DilateIntensity = 6] = "DilateIntensity", t[t.IterativeDistance = 7] = "IterativeDistance", t[t.Open = 8] = "Open", t[t.Close = 9] = "Close", t[t.OpenIntensity = 10] = "OpenIntensity", t[t.CloseIntensity = 11] = "CloseIntensity", t[t.Smooth = 12] = "Smooth", t[t.EdgeIn = 13] = "EdgeIn", t[t.EdgeOut = 14] = "EdgeOut", t[t.Edge = 15] = "Edge", t[t.TopHat = 16] = "TopHat", t[t.BottomHat = 17] = "BottomHat", t[t.HitAndMiss = 18] = "HitAndMiss", t[t.Thinning = 19] = "Thinning", t[t.Thicken = 20] = "Thicken", t[t.Distance = 21] = "Distance", t[t.Voronoi = 22] = "Voronoi", t))(Qu || {}), Dr = /* @__PURE__ */ ((t) => (t[t.Undefined = 0] = "Undefined", t[t.TopLeft = 1] = "TopLeft", t[t.TopRight = 2] = "TopRight", t[t.BottomRight = 3] = "BottomRight", t[t.BottomLeft = 4] = "BottomLeft", t[t.LeftTop = 5] = "LeftTop", t[t.RightTop = 6] = "RightTop", t[t.RightBottom = 7] = "RightBottom", t[t.LeftBottom = 8] = "LeftBottom", t))(Dr || {}), Ju = /* @__PURE__ */ ((t) => (t[t.Undefined = 0] = "Undefined", t[t.Point = 1] = "Point", t[t.Replace = 2] = "Replace", t[t.Floodfill = 3] = "Floodfill", t[t.FillToBorder = 4] = "FillToBorder", t[t.Reset = 5] = "Reset", t))(Ju || {}), Ku = /* @__PURE__ */ ((t) => (t[t.Undefined = 0] = "Undefined", t[t.Average = 1] = "Average", t[t.Average9 = 2] = "Average9", t[t.Average16 = 3] = "Average16", t[t.Background = 4] = "Background", t[t.Bilinear = 5] = "Bilinear", t[t.Blend = 6] = "Blend", t[t.Catrom = 7] = "Catrom", t[t.Integer = 8] = "Integer", t[t.Mesh = 9] = "Mesh", t[t.Nearest = 10] = "Nearest", t[t.Spline = 11] = "Spline", t))(Ku || {}), Zu = /* @__PURE__ */ ((t) => (t[t.Undefined = 0] = "Undefined", t[t.Saturation = 1] = "Saturation", t[t.Perceptual = 2] = "Perceptual", t[t.Absolute = 3] = "Absolute", t[t.Relative = 4] = "Relative", t))(Zu || {}), Ou = /* @__PURE__ */ ((t) => (t[t.Undefined = 0] = "Undefined", t[t.Left = 1] = "Left", t[t.Center = 2] = "Center", t[t.Right = 3] = "Right", t))(Ou || {}), eo = /* @__PURE__ */ ((t) => (t[t.Undefined = 0] = "Undefined", t[t.None = 1] = "None", t[t.Underline = 2] = "Underline", t[t.Overline = 3] = "Overline", t[t.LineThrough = 4] = "LineThrough", t))(eo || {}), to = /* @__PURE__ */ ((t) => (t[t.Undefined = 0] = "Undefined", t[t.Background = 1] = "Background", t[t.Dither = 2] = "Dither", t[t.Edge = 3] = "Edge", t[t.Mirror = 4] = "Mirror", t[t.Random = 5] = "Random", t[t.Tile = 6] = "Tile", t[t.Transparent = 7] = "Transparent", t[t.Mask = 8] = "Mask", t[t.Black = 9] = "Black", t[t.Gray = 10] = "Gray", t[t.White = 11] = "White", t[t.HorizontalTile = 12] = "HorizontalTile", t[t.VerticalTile = 13] = "VerticalTile", t[t.HorizontalTileEdge = 14] = "HorizontalTileEdge", t[t.VerticalTileEdge = 15] = "VerticalTileEdge", t[t.CheckerTile = 16] = "CheckerTile", t))(to || {}), no = /* @__PURE__ */ ((t) => (t[t.Disabled = -1] = "Disabled", t[t.Linear = 0] = "Linear", t[t.Vng = 1] = "Vng", t[t.Ppg = 2] = "Ppg", t[t.Ahd = 3] = "Ahd", t[t.DCB = 4] = "DCB", t[t.Dht = 11] = "Dht", t[t.ModifiedAhd = 12] = "ModifiedAhd", t))(no || {}), ro = /* @__PURE__ */ ((t) => (t[t.Raw = 0] = "Raw", t[t.SRGB = 1] = "SRGB", t[t.AdobeRGB = 2] = "AdobeRGB", t[t.WideGamutRGB = 3] = "WideGamutRGB", t[t.KodakProPhotoRGB = 4] = "KodakProPhotoRGB", t[t.XYZ = 5] = "XYZ", t[t.ACES = 6] = "ACES", t))(ro || {});
class _o extends au {
  constructor() {
    super(be.Dng);
  }
  /**
   * Gets or sets a value indicating wether auto brightness should be used (dng:no-auto-bright).
   */
  disableAutoBrightness;
  /**
   * Gets or sets a value indicating the interpolation quality (dng:interpolation-quality).
   */
  interpolationQuality;
  /**
   * Gets or sets the output color (dng:output-color).
   */
  outputColor;
  /**
  * Gets or sets a value indicating wether auto whitebalance should be used (dng:use-auto-wb).
  */
  useAutoWhitebalance;
  /**
   * Gets or sets a value indicating wether the whitebalance of the camera should be used (dng:use-camera-wb).
   */
  useCameraWhitebalance;
  getDefines() {
    const r = [];
    return this.hasValue(this.interpolationQuality) && r.push(this.createDefine("interpolation-quality", this.interpolationQuality)), this.hasValue(this.disableAutoBrightness) && r.push(this.createDefine("no-auto-bright", this.disableAutoBrightness)), this.hasValue(this.outputColor) && r.push(this.createDefine("output-color", this.outputColor)), this.hasValue(this.useCameraWhitebalance) && r.push(this.createDefine("use-camera-wb", this.useCameraWhitebalance)), this.hasValue(this.useAutoWhitebalance) && r.push(this.createDefine("use-auto-wb", this.useAutoWhitebalance)), r;
  }
}
class Gr {
  _colorSpace = dt.Undefined;
  _compression = Mr.Undefined;
  _density = new hr(0, 0);
  _format = be.Unknown;
  _height = 0;
  _interlace = Ir.Undefined;
  _orientation = Dr.Undefined;
  _quality = 0;
  _width = 0;
  get colorSpace() {
    return this._colorSpace;
  }
  get compression() {
    return this._compression;
  }
  get density() {
    return this._density;
  }
  get format() {
    return this._format;
  }
  get height() {
    return this._height;
  }
  get interlace() {
    return this._interlace;
  }
  get orientation() {
    return this._orientation;
  }
  get quality() {
    return this._quality;
  }
  get width() {
    return this._width;
  }
  constructor() {
  }
  read(r, e) {
    ne._create((o) => {
      o.ping(r, e), this._colorSpace = o.colorSpace, this._compression = o.compression, this._density = o.density, this._format = o.format, this._height = o.height, this._interlace = o.interlace, this._orientation = o.orientation, this._quality = o.quality, this._width = o.width;
    });
  }
  static create(r, e) {
    const o = new Gr();
    return o.read(r, e), o;
  }
}
class lo {
  /**
   * Initializes a new instance of the {@link ComplexSettings} class.
   * @param complexOperator The complex operator.
   */
  constructor(r) {
    this.complexOperator = r;
  }
  /**F
   * Gets or sets the complex operator.
   **/
  complexOperator;
  /**
   * Gets or sets the signal to noise ratio.
   **/
  signalToNoiseRatio;
  /** @internal */
  _setArtifacts(r) {
    this.signalToNoiseRatio !== void 0 && r.setArtifact("complex:snr", this.signalToNoiseRatio);
  }
}
class co {
  constructor(r) {
    this.method = r;
  }
  /**
   * Gets the distortion method to use.
   */
  method;
  /**
   * Gets or sets a value indicating whether distort attempt to 'bestfit' the size of the resulting image.
   */
  bestFit = !1;
  /**
   * Gets or sets a value to scale the size of the output canvas by this amount to provide a method of
   * Zooming, and for super-sampling the results.
   */
  scale;
  /**
   * Gets or sets the viewport that directly set the output image canvas area and offest to use for the
   * resulting image, rather than use the original images canvas, or a calculated 'bestfit' canvas.
   */
  viewport;
  /** @internal */
  _setArtifacts(r) {
    this.scale !== void 0 && r.setArtifact("distort:scale", this.scale.toString()), this.viewport !== void 0 && r.setArtifact("distort:viewport", this.viewport.toString());
  }
}
class ao extends Fe {
  constructor(r) {
    const e = l._api._MontageSettings_Create(), o = l._api._MontageSettings_Dispose;
    if (super(e, o), r.backgroundColor !== void 0 && r.backgroundColor._use((g) => {
      l._api._MontageSettings_SetBackgroundColor(this._instance, g);
    }), r.borderColor !== void 0 && r.borderColor._use((g) => {
      l._api._MontageSettings_SetBorderColor(this._instance, g);
    }), r.borderWidth !== void 0 && l._api._MontageSettings_SetBorderWidth(this._instance, r.borderWidth), r.fillColor !== void 0 && r.fillColor._use((g) => {
      l._api._MontageSettings_SetFillColor(this._instance, g);
    }), r.font !== void 0) {
      const g = De._getFontFileName(r.font);
      L(g, (p) => {
        l._api._MontageSettings_SetFont(this._instance, p);
      });
    }
    r.fontPointsize !== void 0 && l._api._MontageSettings_SetFontPointsize(this._instance, r.fontPointsize), r.frameGeometry !== void 0 && L(r.frameGeometry.toString(), (g) => {
      l._api._MontageSettings_SetFrameGeometry(this._instance, g);
    }), r.geometry !== void 0 && L(r.geometry.toString(), (g) => {
      l._api._MontageSettings_SetGeometry(this._instance, g);
    }), r.gravity !== void 0 && l._api._MontageSettings_SetGravity(this._instance, r.gravity), r.shadow !== void 0 && l._api._MontageSettings_SetShadow(this._instance, r.shadow ? 1 : 0), r.strokeColor !== void 0 && r.strokeColor._use((g) => {
      l._api._MontageSettings_SetStrokeColor(this._instance, g);
    }), r.textureFileName !== void 0 && L(r.textureFileName, (g) => {
      l._api._MontageSettings_SetTextureFileName(this._instance, g);
    }), r.tileGeometry !== void 0 && L(r.tileGeometry.toString(), (g) => {
      l._api._MontageSettings_SetTileGeometry(this._instance, g);
    }), r.title !== void 0 && L(r.title, (g) => {
      l._api._MontageSettings_SetTitle(this._instance, g);
    });
  }
}
class go {
  /**
   * Gets or sets the color of the background that thumbnails are composed on.
   */
  backgroundColor;
  /**
   * Gets or sets the frame border color.
   */
  borderColor;
  /**
   * Gets or sets the pixels between thumbnail and surrounding frame.
   */
  borderWidth;
  /**
   * Gets or sets the fill color.
   */
  fillColor;
  /**
   * Gets or sets the label font.
   */
  font;
  /**
   * Gets or sets the font point size.
   */
  fontPointsize;
  /**
   * Gets or sets the frame geometry (width & height frame thickness).
   */
  frameGeometry;
  /**
   * Gets or sets the thumbnail width & height plus border width &amp; height.
   */
  geometry;
  /**
   * Gets or sets the thumbnail position (e.g. Southwest).
   */
  gravity;
  /**
   * Gets or sets the thumbnail label (applied to image prior to montage).
   */
  label;
  /**
   * Gets or sets a value indicating whether drop-shadows on thumbnails are enabled or disabled.
   */
  shadow;
  /**
   * Gets or sets the outline color.
   */
  strokeColor;
  /**
   * Gets or sets the background texture image.
   */
  textureFileName;
  /**
   * Gets or sets the frame geometry (width &amp; height frame thickness).
   */
  tileGeometry;
  /**
   * Gets or sets the montage title.
   */
  title;
  /**
   * Gets or sets the transparent color.
   */
  transparentColor;
  _use(r) {
    const e = new ao(this);
    return _e._disposeAfterExecution(e, r);
  }
}
class mo {
  constructor(r, e, o) {
    this.method = r, this.kernel = e, o !== void 0 && (this.kernel += `:${o}`);
  }
  /**
   * Gets or sets the channels to apply the kernel to.
   */
  channels = K.Composite;
  /**
   * Gets or sets the bias to use when the method is Convolve.
   */
  convolveBias;
  /**
   * Gets or sets the scale to use when the method is Convolve.
   */
  convolveScale;
  /**
   * Gets or sets the number of iterations.
   */
  iterations = 1;
  /**
   * Gets or sets built-in kernel.
   */
  kernel;
  /**
   * Gets or sets the morphology method.
   */
  method;
}
class fo {
  /**
   * Initializes a new instance of the {@link Threshold} class.
   * @param minimum The minimum value of the threshold.
   * @param maximum The maximum value of the threshold (or 0 if no maximum).
   */
  constructor(r, e = 0) {
    this.minimum = r, this.maximum = e;
  }
  /**
   * Gets the minimum of this threshold.
   */
  minimum;
  /**
  * Gets the maximum of this threshold.
  */
  maximum;
  /**
   * Convert the threshold to a string.
   */
  toString() {
    return this.maximum === 0 ? this.minimum.toString() : `${this.minimum}-${this.maximum}`;
  }
}
export {
  pr as AlphaOption,
  zu as AutoThresholdMethod,
  hu as ChannelStatistics,
  K as Channels,
  _u as ChromaticityInfo,
  Nu as ClassType,
  dt as ColorSpace,
  Hu as ColorType,
  an as CompareResult,
  lu as CompareSettings,
  Uu as ComplexOperator,
  lo as ComplexSettings,
  Rt as CompositeOperator,
  Mr as CompressionMethod,
  _r as ConfigurationFile,
  rn as ConfigurationFiles,
  sn as ConnectedComponent,
  cu as ConnectedComponentsSettings,
  au as DefinesCreator,
  hr as Density,
  dr as DensityUnit,
  Fu as DistortMethod,
  co as DistortSettings,
  ln as DitherMethod,
  no as DngInterpolation,
  ro as DngOutputColor,
  _o as DngReadDefines,
  so as DrawableColor,
  iu as DrawableFillColor,
  su as DrawableFillOpacity,
  vu as DrawableFont,
  uu as DrawableFontPointSize,
  Mu as DrawableGravity,
  Iu as DrawableLine,
  Du as DrawablePoint,
  Gu as DrawableRectangle,
  bu as DrawableRoundRectangle,
  Pu as DrawableStrokeColor,
  Au as DrawableStrokeWidth,
  Lu as DrawableText,
  Eu as DrawableTextAlignment,
  pt as DrawableTextAntialias,
  Tu as DrawableTextDecoration,
  Ru as DrawableTextInterlineSpacing,
  Cu as DrawableTextInterwordSpacing,
  Wu as DrawableTextKerning,
  Bu as DrawableTextUnderColor,
  oo as Drawables,
  Lt as DrawingWand,
  $u as Endian,
  Yu as ErrorMetric,
  ju as EvaluateOperator,
  Xu as FilterType,
  Vu as GifDisposeMethod,
  Ct as Gravity,
  l as ImageMagick,
  fu as ImageProfile,
  Ir as Interlace,
  qu as Kernel,
  ou as LogEvent,
  Q as LogEventTypes,
  De as Magick,
  w as MagickColor,
  xu as MagickColors,
  en as MagickDefine,
  Z as MagickError,
  xt as MagickErrorInfo,
  Bt as MagickErrorSeverity,
  be as MagickFormat,
  Te as MagickFormatInfo,
  ce as MagickGeometry,
  ne as MagickImage,
  Me as MagickImageCollection,
  Gr as MagickImageInfo,
  Ie as MagickReadSettings,
  ft as MagickSettings,
  go as MontageSettings,
  Qu as MorphologyMethod,
  mo as MorphologySettings,
  Fe as NativeInstance,
  Dr as OrientationType,
  Ju as PaintMethod,
  ie as Percentage,
  A as PixelChannel,
  Qe as PixelCollection,
  vr as PixelIntensityMethod,
  Ku as PixelInterpolateMethod,
  ve as Point,
  He as PrimaryInfo,
  ku as ProgressEvent,
  nn as QuantizeSettings,
  Ue as Quantum,
  Zu as RenderingIntent,
  cn as Statistics,
  Ou as TextAlignment,
  eo as TextDecoration,
  fo as Threshold,
  on as TypeMetric,
  to as VirtualPixelMethod,
  mr as WarningEvent,
  mu as _getEdges,
  fr as _isByteArray,
  uo as initializeImageMagick
};

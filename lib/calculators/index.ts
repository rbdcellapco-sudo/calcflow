import type { CalculatorDef } from "../types";
import { percentageCalculator } from "./percentage";
import { tipCalculator } from "./tip";
import { bmiCalculator } from "./bmi";
import { ageCalculator } from "./age";
import { mortgageCalculator } from "./mortgage";
import { loanCalculator } from "./loan";
import { compoundInterestCalculator } from "./compound-interest";
import { scientificCalculator } from "./scientific";
import { simpleInterestCalculator } from "./simple-interest";
import { cdCalculator } from "./cd";
import { presentValueCalculator } from "./present-value";
import { futureValueCalculator } from "./future-value";
import { paybackPeriodCalculator } from "./payback-period";
import { roiCalculator } from "./roi";
import { irrCalculator } from "./irr";
import { retirementCalculator } from "./retirement";
import { annuityCalculator } from "./annuity";
import { k401Calculator } from "./401k";
import { iraCalculator } from "./ira";
import { rothIraCalculator } from "./roth-ira";
import { rmdCalculator } from "./rmd";
import { pensionCalculator } from "./pension";
import { socialSecurityCalculator } from "./social-security";
import { autoLoanCalculator } from "./auto-loan";
import { autoLeaseCalculator } from "./auto-lease";
import { businessLoanCalculator } from "./business-loan";
import { refinanceCalculator } from "./refinance";
import { homeEquityLoanCalculator } from "./home-equity-loan";
import { helocCalculator } from "./heloc";
import { downPaymentCalculator } from "./down-payment";
import { debtToIncomeRatioCalculator } from "./debt-to-income-ratio";
import { creditCardPayoffCalculator } from "./credit-card-payoff";
import { debtPayoffCalculator } from "./debt-payoff";
import { debtConsolidationCalculator } from "./debt-consolidation";
import { studentLoanCalculator } from "./student-loan";
import { collegeCostCalculator } from "./college-cost";
import { cashBackOrLowInterestCalculator } from "./cash-back-or-low-interest";
import { depreciationCalculator } from "./depreciation";
import { houseAffordabilityCalculator } from "./house-affordability";
import { rentCalculator } from "./rent";
import { rentVsBuyCalculator } from "./rent-vs-buy";
import { rentalPropertyCalculator } from "./rental-property";
import { mortgagePayoffCalculator } from "./mortgage-payoff";
import { aprCalculator } from "./apr";
import { salesTaxCalculator } from "./sales-tax";
import { vatCalculator } from "./vat";
import { incomeTaxCalculator } from "./income-tax";
import { salaryCalculator } from "./salary";
import { inflationCalculator } from "./inflation";
import { commissionCalculator } from "./commission";
import { marginCalculator } from "./margin";
import { discountCalculator } from "./discount";
import { bondCalculator } from "./bond";
import { mutualFundCalculator } from "./mutual-fund";
import { averageReturnCalculator } from "./average-return";
import { budgetCalculator } from "./budget";
import { currencyCalculator } from "./currency";
import { bmrCalculator } from "./bmr";
import { calorieCalculator } from "./calorie";
import { bodyFatCalculator } from "./body-fat";
import { macroCalculator } from "./macro";
import { healthyWeightCalculator } from "./healthy-weight";
import { overweightCalculator } from "./overweight";
import { leanBodyMassCalculator } from "./lean-body-mass";
import { caloriesBurnedCalculator } from "./calories-burned";
import { oneRepMaxCalculator } from "./one-rep-max";
import { targetHeartRateCalculator } from "./target-heart-rate";
import { bodyTypeCalculator } from "./body-type";
import { bodySurfaceAreaCalculator } from "./body-surface-area";
import { bacCalculator } from "./bac";
import { gfrCalculator } from "./gfr";
import { dueDateCalculator } from "./due-date";
import { ovulationCalculator } from "./ovulation";
import { periodCalculator } from "./period";
import { pregnancyWeightGainCalculator } from "./pregnancy-weight-gain";
import { fractionCalculator } from "./fraction";
import { triangleCalculator } from "./triangle";
import { rightTriangleCalculator } from "./right-triangle";
import { areaCalculator } from "./area";
import { volumeCalculator } from "./volume";
import { surfaceAreaCalculator } from "./surface-area";
import { exponentCalculator } from "./exponent";
import { rootCalculator } from "./root";
import { scientificNotationCalculator } from "./scientific-notation";
import { baseConverterCalculator } from "./base-converter";
import { lcmCalculator } from "./lcm";
import { gcfCalculator } from "./gcf";
import { factorCalculator } from "./factor";
import { primeFactorizationCalculator } from "./prime-factorization";
import { statisticsCalculator } from "./statistics";
import { zScoreCalculator } from "./z-score";
import { confidenceIntervalCalculator } from "./confidence-interval";
import { sampleSizeCalculator } from "./sample-size";
import { pValueCalculator } from "./p-value";
import { probabilityCalculator } from "./probability";
import { permutationCombinationCalculator } from "./permutation-combination";
import { randomNumberCalculator } from "./random-number";
import { numberSequenceCalculator } from "./number-sequence";
import { percentErrorCalculator } from "./percent-error";
import { halfLifeCalculator } from "./half-life";
import { quadraticFormulaCalculator } from "./quadratic-formula";
import { slopeCalculator } from "./slope";
import { logCalculator } from "./log";
import { ratioCalculator } from "./ratio";
import { distanceCalculator } from "./distance";
import { roundingCalculator } from "./rounding";
import { matrixCalculator } from "./matrix";
import { bigNumberCalculator } from "./big-number";
import { longDivisionCalculator } from "./long-division";
import { dateCalcCalculator } from "./date-calc";
import { dayOfWeekCalculator } from "./day-of-week";
import { timeCalcCalculator } from "./time-calc";
import { hoursCalculator } from "./hours";
import { gpaCalculator } from "./gpa";
import { gradeCalculator } from "./grade";
import { heightPredictorCalculator } from "./height-predictor";
import { concreteCalculator } from "./concrete";
import { squareFootageCalculator } from "./square-footage";
import { tileCalculator } from "./tile";
import { mulchGravelCalculator } from "./mulch-gravel";
import { roofingCalculator } from "./roofing";
import { stairCalculator } from "./stair";
import { ipSubnetCalculator } from "./ip-subnet";
import { braSizeCalculator } from "./bra-size";
import { passwordGeneratorCalculator } from "./password-generator";
import { diceRollerCalculator } from "./dice-roller";
import { unitConverterCalculator } from "./unit-converter";
import { fuelCostCalculator } from "./fuel-cost";
import { gasMileageCalculator } from "./gas-mileage";
import { mileageReimbursementCalculator } from "./mileage-reimbursement";
import { ohmsLawCalculator } from "./ohms-law";
import { resistorCalculator } from "./resistor";
import { electricityCostCalculator } from "./electricity-cost";
import { voltageDropCalculator } from "./voltage-drop";
import { btuCalculator } from "./btu";
import { horsepowerCalculator } from "./horsepower";
import { bandwidthCalculator } from "./bandwidth";
import { shoeSizeCalculator } from "./shoe-size";
import { densityCalculator } from "./density";
import { speedCalculator } from "./speed";
import { molarityCalculator } from "./molarity";
import { molecularWeightCalculator } from "./molecular-weight";
import { romanNumeralCalculator } from "./roman-numeral";
import { golfHandicapCalculator } from "./golf-handicap";
import { sleepCalculator } from "./sleep";
import { tireSizeCalculator } from "./tire-size";
import { windChillCalculator } from "./wind-chill";
import { heatIndexCalculator } from "./heat-index";
import { dewPointCalculator } from "./dew-point";
import { base64Calculator } from "./base64";
import { urlEncodeCalculator } from "./url-encode";
import { gdpCalculator } from "./gdp";

/**
 * Central registry. Adding a new calculator anywhere in the app means
 * creating lib/calculators/<slug>.ts and adding one line here - the shell,
 * search, categories, favorites, and history all pick it up automatically.
 */
export const allCalculators: CalculatorDef[] = [
  percentageCalculator,
  tipCalculator,
  bmiCalculator,
  ageCalculator,
  mortgageCalculator,
  loanCalculator,
  compoundInterestCalculator,
  scientificCalculator,
  simpleInterestCalculator,
  cdCalculator,
  presentValueCalculator,
  futureValueCalculator,
  paybackPeriodCalculator,
  roiCalculator,
  irrCalculator,
  retirementCalculator,
  annuityCalculator,
  k401Calculator,
  iraCalculator,
  rothIraCalculator,
  rmdCalculator,
  pensionCalculator,
  socialSecurityCalculator,
  autoLoanCalculator,
  autoLeaseCalculator,
  businessLoanCalculator,
  refinanceCalculator,
  homeEquityLoanCalculator,
  helocCalculator,
  downPaymentCalculator,
  debtToIncomeRatioCalculator,
  creditCardPayoffCalculator,
  debtPayoffCalculator,
  debtConsolidationCalculator,
  studentLoanCalculator,
  collegeCostCalculator,
  cashBackOrLowInterestCalculator,
  depreciationCalculator,
  houseAffordabilityCalculator,
  rentCalculator,
  rentVsBuyCalculator,
  rentalPropertyCalculator,
  mortgagePayoffCalculator,
  aprCalculator,
  salesTaxCalculator,
  vatCalculator,
  incomeTaxCalculator,
  salaryCalculator,
  inflationCalculator,
  commissionCalculator,
  marginCalculator,
  discountCalculator,
  bondCalculator,
  mutualFundCalculator,
  averageReturnCalculator,
  budgetCalculator,
  currencyCalculator,
  bmrCalculator,
  calorieCalculator,
  bodyFatCalculator,
  macroCalculator,
  healthyWeightCalculator,
  overweightCalculator,
  leanBodyMassCalculator,
  caloriesBurnedCalculator,
  oneRepMaxCalculator,
  targetHeartRateCalculator,
  bodyTypeCalculator,
  bodySurfaceAreaCalculator,
  bacCalculator,
  gfrCalculator,
  dueDateCalculator,
  ovulationCalculator,
  periodCalculator,
  pregnancyWeightGainCalculator,
  fractionCalculator,
  triangleCalculator,
  rightTriangleCalculator,
  areaCalculator,
  volumeCalculator,
  surfaceAreaCalculator,
  exponentCalculator,
  rootCalculator,
  scientificNotationCalculator,
  baseConverterCalculator,
  lcmCalculator,
  gcfCalculator,
  factorCalculator,
  primeFactorizationCalculator,
  statisticsCalculator,
  zScoreCalculator,
  confidenceIntervalCalculator,
  sampleSizeCalculator,
  pValueCalculator,
  probabilityCalculator,
  permutationCombinationCalculator,
  randomNumberCalculator,
  numberSequenceCalculator,
  percentErrorCalculator,
  halfLifeCalculator,
  quadraticFormulaCalculator,
  slopeCalculator,
  logCalculator,
  ratioCalculator,
  distanceCalculator,
  roundingCalculator,
  matrixCalculator,
  bigNumberCalculator,
  longDivisionCalculator,
  dateCalcCalculator,
  dayOfWeekCalculator,
  timeCalcCalculator,
  hoursCalculator,
  gpaCalculator,
  gradeCalculator,
  heightPredictorCalculator,
  concreteCalculator,
  squareFootageCalculator,
  tileCalculator,
  mulchGravelCalculator,
  roofingCalculator,
  stairCalculator,
  ipSubnetCalculator,
  braSizeCalculator,
  passwordGeneratorCalculator,
  diceRollerCalculator,
  unitConverterCalculator,
  fuelCostCalculator,
  gasMileageCalculator,
  mileageReimbursementCalculator,
  ohmsLawCalculator,
  resistorCalculator,
  electricityCostCalculator,
  voltageDropCalculator,
  btuCalculator,
  horsepowerCalculator,
  bandwidthCalculator,
  shoeSizeCalculator,
  densityCalculator,
  speedCalculator,
  molarityCalculator,
  molecularWeightCalculator,
  romanNumeralCalculator,
  golfHandicapCalculator,
  sleepCalculator,
  tireSizeCalculator,
  windChillCalculator,
  heatIndexCalculator,
  dewPointCalculator,
  base64Calculator,
  urlEncodeCalculator,
  gdpCalculator,
];

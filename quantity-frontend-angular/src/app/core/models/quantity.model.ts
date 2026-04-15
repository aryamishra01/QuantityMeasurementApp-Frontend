export interface QuantityDTO {
  value: number;
  unit: string;
  measurementType: 'LengthUnit' | 'WeightUnit' | 'VolumeUnit' | 'TemperatureUnit';
  operationType?: string;
}

export interface QuantityInputDTO {
  thisQuantityDTO: QuantityDTO;
  thatQuantityDTO?: QuantityDTO | null;
  targetUnit?: string | null;
}

export interface QuantityMeasurementDTO {
  id?: number;
  thisValue?: number;
  thisUnit?: string;
  thisMeasurementType?: string;
  thatValue?: number;
  thatUnit?: string;
  thatMeasurementType?: string;
  operation?: string;
  resultValue?: number | string;
  resultUnit?: string;
  errorMessage?: string;
  error?: boolean;
  createdAt?: string;
}
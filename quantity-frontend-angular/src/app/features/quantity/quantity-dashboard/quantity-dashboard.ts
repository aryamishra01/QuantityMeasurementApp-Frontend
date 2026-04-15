import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { QuantityService } from '../../../core/services/quantity.service';
import { QuantityDTO, QuantityInputDTO, QuantityMeasurementDTO } from '../../../core/models/quantity.model';
import { NavbarComponent } from '../../../shared/navbar/navbar';

type OperationType = 'compare' | 'convert' | 'add' | 'subtract' | 'divide';

@Component({
  selector: 'app-quantity-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent],
  templateUrl: './quantity-dashboard.html',
  styleUrls: ['./quantity-dashboard.css']
})
export class QuantityDashboardComponent implements OnInit {
  private fb = inject(FormBuilder);
  private quantityService = inject(QuantityService);
  private router = inject(Router);
  private authService = inject(AuthService);

  loading = false;
  errorMessage = '';
  successMessage = '';
  response: QuantityMeasurementDTO | null = null;
  loadingCounts = false;
  errorCounts = '';
  pendingCountRequests = 0;
  countByOperation: Record<OperationType, number | null> = {
    compare: null,
    convert: null,
    add: null,
    subtract: null,
    divide: null
  };

  operations: OperationType[] = ['compare', 'convert', 'add', 'subtract', 'divide'];

  operationIcons: Record<OperationType, string> = {
    compare: '⚖️',
    convert: '🔁',
    add: '➕',
    subtract: '➖',
    divide: '➗'
  };

  measurementTypes: QuantityDTO['measurementType'][] = ['LengthUnit', 'WeightUnit', 'VolumeUnit', 'TemperatureUnit'];

  measurementTypeLabels: Record<QuantityDTO['measurementType'], string> = {
    LengthUnit: '📏 Length',
    WeightUnit: '⚖️ Weight',
    VolumeUnit: '🧪 Volume',
    TemperatureUnit: '🌡️ Temperature'
  };

  unitsByType: Record<QuantityDTO['measurementType'], string[]> = {
    LengthUnit: ['FEET', 'INCHES', 'YARD'],
    WeightUnit: ['GRAM', 'KILOGRAM', 'TONNE'],
    VolumeUnit: ['MILLILITER', 'LITER', 'KILOLITER', 'GALLON'],
    TemperatureUnit: ['CELSIUS', 'FAHRENHEIT', 'KELVIN']
  };

  form = this.fb.group({
    operation: ['compare' as OperationType, Validators.required],
    value1: [null as number | null, Validators.required],
    type1: ['LengthUnit' as QuantityDTO['measurementType'], Validators.required],
    unit1: ['FEET', Validators.required],
    value2: [null as number | null],
    type2: ['LengthUnit' as QuantityDTO['measurementType']],
    unit2: ['INCHES', Validators.required],
    targetUnit: ['INCHES']
  });

  selectedOperation = computed(() => this.form.get('operation')?.value as OperationType);
  isConvertMode = computed(() => this.selectedOperation() === 'convert');

  get units1(): string[] {
    const type = this.form.get('type1')?.value || 'LengthUnit';
    return this.unitsByType[type];
  }

  get units2(): string[] {
    const type = this.form.get('type2')?.value || 'LengthUnit';
    return this.unitsByType[type];
  }

  get targetUnits(): string[] {
    const type = this.form.get('type1')?.value || 'LengthUnit';
    return this.unitsByType[type];
  }

  constructor() {
    this.applyDynamicValidation();

    this.form.get('operation')?.valueChanges.subscribe(() => {
      this.applyDynamicValidation();
      this.errorMessage = '';
      this.successMessage = '';
      this.response = null;
    });

    this.form.get('type1')?.valueChanges.subscribe((type) => {
      const units = this.unitsByType[type || 'LengthUnit'];
      this.form.patchValue({
        unit1: units[0],
        targetUnit: this.selectedOperation() === 'convert' ? units[0] : this.form.value.targetUnit
      });
    });

    this.form.get('type2')?.valueChanges.subscribe((type) => {
      const units = this.unitsByType[type || 'LengthUnit'];
      this.form.patchValue({
        unit2: units[0]
      });
    });
  }

  ngOnInit(): void {
    this.loadCounts();
  }

  private loadCounts(): void {
    this.loadingCounts = true;
    this.errorCounts = '';
    this.pendingCountRequests = this.operations.length;

    this.operations.forEach((operation) => {
      this.quantityService.getCountByOperation(operation).subscribe({
        next: (count) => {
          this.countByOperation[operation] = count;
          this.pendingCountRequests -= 1;
          if (this.pendingCountRequests <= 0) {
            this.loadingCounts = false;
          }
        },
        error: (error) => {
          if (error?.status === 401 || error?.status === 403) {
            this.handleUnauthorized();
            return;
          }
          this.errorCounts =
            error?.error?.message ||
            error?.message ||
            'Unable to load operation metrics.';
          this.pendingCountRequests -= 1;
          if (this.pendingCountRequests <= 0) {
            this.loadingCounts = false;
          }
        }
      });
    });
  }

  private applyDynamicValidation(): void {
    const operation = this.form.get('operation')?.value;

    const value2 = this.form.get('value2');
    const type2 = this.form.get('type2');
    const unit2 = this.form.get('unit2');
    const targetUnit = this.form.get('targetUnit');

    value2?.clearValidators();
    type2?.clearValidators();
    unit2?.clearValidators();
    targetUnit?.clearValidators();

    if (operation === 'convert') {
      targetUnit?.setValidators([Validators.required]);
      value2?.setValue(null, { emitEvent: false });
    } else {
      value2?.setValidators([Validators.required]);
      type2?.setValidators([Validators.required]);
      unit2?.setValidators([Validators.required]);
    }

    value2?.updateValueAndValidity();
    type2?.updateValueAndValidity();
    unit2?.updateValueAndValidity();
    targetUnit?.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.response = null;

    const operation = this.form.value.operation as OperationType;

    const payload: QuantityInputDTO = {
      thisQuantityDTO: {
        value: Number(this.form.value.value1),
        measurementType: this.form.value.type1 as QuantityDTO['measurementType'],
        unit: this.form.value.unit1!
      }
    };

    if (operation === 'convert') {
      payload.targetUnit = this.form.value.targetUnit ?? null;
    } else {
      payload.thatQuantityDTO = {
        value: Number(this.form.value.value2),
        measurementType: this.form.value.type2 as QuantityDTO['measurementType'],
        unit: this.form.value.unit2!
      };
    }

    console.log('Submitting payload:', payload);

    let request$;
    switch (operation) {
      case 'compare':
        request$ = this.quantityService.compare(payload);
        break;
      case 'convert':
        request$ = this.quantityService.convert(payload);
        break;
      case 'add':
        request$ = this.quantityService.add(payload);
        break;
      case 'subtract':
        request$ = this.quantityService.subtract(payload);
        break;
      case 'divide':
        request$ = this.quantityService.divide(payload);
        break;
      default:
        this.loading = false;
        this.errorMessage = 'Invalid operation selected.';
        return;
    }

    request$.pipe(finalize(() => (this.loading = false))).subscribe({
      next: (response) => {
        console.log('API response:', response);
        this.response = response;
        this.successMessage = `${operation.toUpperCase()} completed successfully.`;
      },
      error: (error) => {
        console.log('API error:', error);
        this.response = null;
        if (error?.status === 401 || error?.status === 403) {
          this.handleUnauthorized();
          return;
        }
        this.errorMessage =
          error?.error?.errorMessage ||
          error?.error?.message ||
          error?.message ||
          'Unable to complete the request. Please verify values and try again.';
      }
    });
  }

  resetForm(): void {
    this.form.reset({
      operation: 'compare',
      value1: null,
      type1: 'LengthUnit',
      unit1: 'FEET',
      value2: null,
      type2: 'LengthUnit',
      unit2: 'INCHES',
      targetUnit: 'INCHES'
    });
    this.applyDynamicValidation();
    this.errorMessage = '';
    this.successMessage = '';
    this.response = null;
  }

  fillCompareSample(): void {
    this.form.patchValue({
      operation: 'compare',
      value1: 10,
      type1: 'LengthUnit',
      unit1: 'FEET',
      value2: 120,
      type2: 'LengthUnit',
      unit2: 'INCHES',
      targetUnit: 'INCHES'
    });
    this.applyDynamicValidation();
  }

  fillConvertSample(): void {
    this.form.patchValue({
      operation: 'convert',
      value1: 10,
      type1: 'LengthUnit',
      unit1: 'FEET',
      value2: null,
      type2: 'LengthUnit',
      unit2: 'INCHES',
      targetUnit: 'INCHES'
    });
    this.applyDynamicValidation();
  }

  refreshCounts(): void {
    this.loadCounts();
  }

  private handleUnauthorized(): void {
    this.errorMessage = 'Session expired or not authenticated. Redirecting to login...';
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

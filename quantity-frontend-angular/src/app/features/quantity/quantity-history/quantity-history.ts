import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuantityService } from '../../../core/services/quantity.service';
import { QuantityMeasurementDTO } from '../../../core/models/quantity.model';
import { NavbarComponent } from '../../../shared/navbar/navbar';

type OperationType = 'compare' | 'convert' | 'add' | 'subtract' | 'divide';
type MeasurementType = 'LengthUnit' | 'WeightUnit' | 'VolumeUnit' | 'TemperatureUnit';

@Component({
  selector: 'app-quantity-history',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './quantity-history.html',
  styleUrls: ['./quantity-history.css']
})
export class QuantityHistoryComponent implements OnInit {
  private quantityService = inject(QuantityService);

  operations: OperationType[] = ['compare', 'convert', 'add', 'subtract', 'divide'];
  measurementTypes: MeasurementType[] = ['LengthUnit', 'WeightUnit', 'VolumeUnit', 'TemperatureUnit'];

  selectedOperation: OperationType = 'compare';
  selectedMeasurementType: MeasurementType = 'LengthUnit';

  historyByOperation: QuantityMeasurementDTO[] = [];
  historyByType: QuantityMeasurementDTO[] = [];
  erroredHistory: QuantityMeasurementDTO[] = [];

  countByOperation: Record<OperationType, number | null> = {
    compare: null,
    convert: null,
    add: null,
    subtract: null,
    divide: null
  };

  loadingOperation = false;
  loadingType = false;
  loadingErrored = false;
  loadingCounts = false;

  errorOperation = '';
  errorType = '';
  errorErrored = '';
  errorCounts = '';

  ngOnInit(): void {
    this.loadCounts();
    this.loadHistoryByOperation();
    this.loadHistoryByType();
    this.loadErroredHistory();
  }

  loadHistoryByOperation(): void {
    this.loadingOperation = true;
    this.errorOperation = '';
    this.historyByOperation = [];

    console.log('Loading history by operation:', this.selectedOperation);

    this.quantityService.getHistoryByOperation(this.selectedOperation).subscribe({
      next: (items) => {
        console.log('History by operation response:', items);
        this.historyByOperation = items;
        this.loadingOperation = false;
      },
      error: (error) => {
        console.log('History by operation error:', error);
        this.errorOperation =
          error?.error?.message ||
          error?.message ||
          'Unable to load operation history.';
        this.loadingOperation = false;
      }
    });
  }

  loadHistoryByType(): void {
    this.loadingType = true;
    this.errorType = '';
    this.historyByType = [];

    console.log('Loading history by measurement type:', this.selectedMeasurementType);

    this.quantityService.getHistoryByMeasurementType(this.selectedMeasurementType).subscribe({
      next: (items) => {
        console.log('History by type response:', items);
        this.historyByType = items;
        this.loadingType = false;
      },
      error: (error) => {
        console.log('History by type error:', error);
        this.errorType =
          error?.error?.message ||
          error?.message ||
          'Unable to load measurement type history.';
        this.loadingType = false;
      }
    });
  }

  loadErroredHistory(): void {
    this.loadingErrored = true;
    this.errorErrored = '';
    this.erroredHistory = [];

    console.log('Loading errored history');

    this.quantityService.getErroredHistory().subscribe({
      next: (items) => {
        console.log('Errored history response:', items);
        this.erroredHistory = items;
        this.loadingErrored = false;
      },
      error: (error) => {
        console.log('Errored history error:', error);
        this.errorErrored =
          error?.error?.message ||
          error?.message ||
          'Unable to load errored history.';
        this.loadingErrored = false;
      }
    });
  }

  loadCounts(): void {
    this.loadingCounts = true;
    this.errorCounts = '';
    let pending = this.operations.length;

    const finish = () => {
      pending -= 1;
      if (pending <= 0) {
        this.loadingCounts = false;
      }
    };

    const loadOne = (operation: OperationType) => {
      this.quantityService.getCountByOperation(operation).subscribe({
        next: (count) => {
          console.log(`Count for ${operation}:`, count);
          this.countByOperation[operation] = count;
          finish();
        },
        error: (error) => {
          console.log(`Count error for ${operation}:`, error);
          this.errorCounts =
            error?.error?.message ||
            error?.message ||
            'Unable to load operation counts.';
          finish();
        }
      });
    };

    this.operations.forEach((operation) => loadOne(operation));
  }

  refreshAll(): void {
    this.loadCounts();
    this.loadHistoryByOperation();
    this.loadHistoryByType();
    this.loadErroredHistory();
  }
}

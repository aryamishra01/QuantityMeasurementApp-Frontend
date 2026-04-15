import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { QuantityInputDTO, QuantityMeasurementDTO } from '../models/quantity.model';

@Injectable({
  providedIn: 'root'
})
export class QuantityService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/api/v1/quantities`;

  compare(payload: QuantityInputDTO): Observable<QuantityMeasurementDTO> {
    return this.http.post<QuantityMeasurementDTO>(`${this.baseUrl}/compare`, payload);
  }

  convert(payload: QuantityInputDTO): Observable<QuantityMeasurementDTO> {
    return this.http.post<QuantityMeasurementDTO>(`${this.baseUrl}/convert`, payload);
  }

  add(payload: QuantityInputDTO): Observable<QuantityMeasurementDTO> {
    return this.http.post<QuantityMeasurementDTO>(`${this.baseUrl}/add`, payload);
  }

  subtract(payload: QuantityInputDTO): Observable<QuantityMeasurementDTO> {
    return this.http.post<QuantityMeasurementDTO>(`${this.baseUrl}/subtract`, payload);
  }

  divide(payload: QuantityInputDTO): Observable<QuantityMeasurementDTO> {
    return this.http.post<QuantityMeasurementDTO>(`${this.baseUrl}/divide`, payload);
  }

  getHistoryByOperation(operation: string): Observable<QuantityMeasurementDTO[]> {
    return this.http.get<QuantityMeasurementDTO[]>(`${this.baseUrl}/history/operation/${operation}`);
  }

  getHistoryByMeasurementType(measurementType: string): Observable<QuantityMeasurementDTO[]> {
    return this.http.get<QuantityMeasurementDTO[]>(`${this.baseUrl}/history/type/${measurementType}`);
  }

  getErroredHistory(): Observable<QuantityMeasurementDTO[]> {
    return this.http.get<QuantityMeasurementDTO[]>(`${this.baseUrl}/history/errored`);
  }

  getCountByOperation(operation: string): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/count/${operation}`);
  }
}
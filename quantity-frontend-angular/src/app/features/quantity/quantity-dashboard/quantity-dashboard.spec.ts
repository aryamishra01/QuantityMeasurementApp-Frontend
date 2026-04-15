import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuantityDashboard } from './quantity-dashboard';

describe('QuantityDashboard', () => {
  let component: QuantityDashboard;
  let fixture: ComponentFixture<QuantityDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuantityDashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(QuantityDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

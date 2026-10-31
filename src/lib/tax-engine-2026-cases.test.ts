/**
 * Cas chiffrés 2026 recalculés à la main avec les paramètres officiels (relus le 2026-10-31) :
 * - ARC, T4127 122e et 123e éditions (tables 8.1 et 8.2 : taux, seuils, CEA 1 501 $, réduction C.-B. 690 $) ;
 * - Finances Québec, paramètres 2026 (tranches 54 345 / 108 680 / 132 245, montant de base 18 952 $,
 *   déduction pour travailleurs 6 % max 1 450 $) ;
 * - Budget C.-B. 2026 : 1re tranche 5,60 %.
 * Valeurs attendues identiques à celles de l'audit de Sami du 2026-10-28 (net annuel, au dollar près).
 */
import { describe, it, expect } from 'vitest';
import { calculateTakeHome } from './tax-engine-ca';

const net = (g: number, p: string) => calculateTakeHome({ grossAnnual: g, provinceCode: p, payFrequency: 'annual' });

describe('Net annuel 2026 (audit 2026-10-28)', () => {
  it('Ontario 75 000 : fédéral 8 259, Ontario 3 696, net 56 926', () => {
    const r = net(75000, 'ON');
    expect(r.federalIncomeTax).toBeCloseTo(8259, -1);
    expect(r.provincialTax).toBeCloseTo(3696, -1);
    expect(Math.abs(r.netAnnual - 56926)).toBeLessThanOrEqual(2);
  });
  it('Ontario 40 000 : net 32 814', () => expect(Math.abs(net(40000, 'ON').netAnnual - 32814)).toBeLessThanOrEqual(2));
  it('Ontario 150 000 : net 104 320', () => expect(Math.abs(net(150000, 'ON').netAnnual - 104320)).toBeLessThanOrEqual(2));
  it('Québec 75 000 : fédéral 6 856, Québec 8 466, net 53 965', () => {
    const r = net(75000, 'QC');
    expect(Math.abs(r.federalIncomeTax - 6856)).toBeLessThanOrEqual(1);
    expect(Math.abs(r.provincialTax - 8466)).toBeLessThanOrEqual(1);
    expect(Math.abs(r.netAnnual - 53965)).toBeLessThanOrEqual(2);
  });
  it('Alberta 75 000 : net 57 362', () => expect(Math.abs(net(75000, 'AB').netAnnual - 57362)).toBeLessThanOrEqual(2));
  it('Alberta 30 000 : net 26 124', () => expect(Math.abs(net(30000, 'AB').netAnnual - 26124)).toBeLessThanOrEqual(2));
  it('Colombie-Britannique 75 000 : net 57 711', () => expect(Math.abs(net(75000, 'BC').netAnnual - 57711)).toBeLessThanOrEqual(2));
});

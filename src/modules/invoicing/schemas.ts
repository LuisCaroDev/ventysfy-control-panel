import { z } from 'zod';

export const colDocumentSchema = z.object({
  documentType: z.enum([
    'INVOICE',
    'CREDIT_NOTE',
    'DEBIT_NOTE',
    'EQUIVALENT_DOCUMENT',
    'WITHHOLDING_CERTIFICATE',
  ]),
  documentStatus: z.string(),
  documentDate: z.string(),
  documentNumber: z.string().min(1),
  totalAmount: z.number().nonnegative(),
  providerData: z.any().optional(),
});

export type ColDocument = z.infer<typeof colDocumentSchema>;

export const colFiscalRecordResponseSchema = z.object({
  businessId: z.string(),
  docNumber: z.string(),
  docType: z.enum(['Invoice', 'Pos', 'CreditNote']),
  status: z.enum(['approved', 'rejected', 'contingency_dian', 'unknown', 'contingency_taxxa']),
  createdAt: z.string(),
  updatedAt: z.string(),
  invoiceData: z.any().optional(),
  taxxaResponse: z.any().optional(),
  taxxaRequest: z.any().optional(),
});

export type ColFiscalRecordResponse = z.infer<typeof colFiscalRecordResponseSchema>;

// Permissive schema — parses the API response, all fields optional with defaults
export const codeNameSchema = z.object({
  code: z.string().default(''),
  name: z.string().default(''),
});

export const invoicingConfigApiSchema = z.object({
  prod: z.boolean().default(false),
  providerUrl: z.string().default(''),
  taxxaEmail: z.string().default(''),
  taxxaPassword: z.string().default(''),
  organization: codeNameSchema.default({ code: '', name: '' }),
  regime: codeNameSchema.default({ code: '', name: '' }),
  responsability: codeNameSchema.default({ code: '', name: '' }),
  department: codeNameSchema.default({ code: '', name: '' }),
  province: codeNameSchema.default({ code: '', name: '' }),
});

export type InvoicingConfigApiValues = z.infer<typeof invoicingConfigApiSchema>;

// Strict schema — used only on form submit
export const invoicingFormSchema = z.object({
  prod: z.boolean().default(false),
  providerUrl: z.string().min(1, 'La URL del proveedor es requerida.'),
  taxxaEmail: z.string().email('Por favor ingrese un correo válido.'),
  taxxaPassword: z.string().min(1, 'La contraseña es requerida.'),
  organization: z.string().min(1, 'La organización es requerida.'),
  regime: z.string().min(1, 'El régimen es requerido.'),
  responsability: z.string().min(1, 'La responsabilidad es requerida.'),
  department: z.string().min(1, 'El departamento es requerido.'),
  province: z.string().min(1, 'La provincia es requerida.'),
});

export type InvoicingFormValues = z.infer<typeof invoicingFormSchema>;

// Constant Options for Selector Fields
export const organizationOptions = [
  { code: 'person', name: 'Persona' },
  { code: 'company', name: 'Empresa' },
];

export const regimeOptions = [
  { code: '48', name: 'Persona jurídica y asimiladas' },
  { code: '49', name: 'No responsable' },
];

export const responsabilityOptions = [
  { code: 'O-13', name: 'Gran contribuyente' },
  { code: 'O-15', name: 'Autorretenedor' },
  { code: 'O-23', name: 'Agente de retención en la fuente' },
  { code: 'O-47', name: 'Régimen simple de tributación' },
  { code: 'R-99-PN', name: 'No aplica – Otros' },
];

// Map of Colombia departments for name lookup
export const colombiaDepartments: Record<string, string> = {
  '05': 'Antioquia',
  '08': 'Atlántico',
  '11': 'Bogotá, D.C.',
  '13': 'Bolívar',
  '15': 'Boyacá',
  '17': 'Caldas',
  '18': 'Caquetá',
  '19': 'Cauca',
  '20': 'Cesar',
  '23': 'Córdoba',
  '25': 'Cundinamarca',
  '27': 'Chocó',
  '41': 'Huila',
  '44': 'La Guajira',
  '47': 'Magdalena',
  '50': 'Meta',
  '52': 'Nariño',
  '54': 'Norte de Santander',
  '63': 'Quindío',
  '66': 'Risaralda',
  '68': 'Santander',
  '70': 'Sucre',
  '73': 'Tolima',
  '76': 'Valle del Cauca',
  '81': 'Arauca',
  '85': 'Casanare',
  '86': 'Putumayo',
  '88': 'San Andrés y Providencia',
  '91': 'Amazonas',
  '94': 'Guainía',
  '95': 'Guaviare',
  '97': 'Vaupés',
  '99': 'Vichada',
};

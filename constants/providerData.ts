
export interface ProviderData {
    id: string;
    name: string;
    icon: string;
    isPrimary?: boolean;
    status: 'active' | 'coming_soon';
    methods: { type: 'pix' | 'card'; label: string }[];
}

export const providers: ProviderData[] = [
    {
        id: 'syncpay',
        name: 'SyncPay (Oficial)',
        icon: 'fa-bolt',
        isPrimary: true,
        status: 'active',
        methods: [
            { type: 'pix', label: 'PIX' }
        ]
    },
    {
        id: 'stripe',
        name: 'Stripe',
        icon: 'fa-brands fa-stripe',
        status: 'active',
        methods: [
            { type: 'card', label: 'Cartão' }
        ]
    },
    {
        id: 'paypal',
        name: 'PayPal',
        icon: 'fa-brands fa-paypal',
        status: 'active',
        methods: [
            { type: 'pix', label: 'PIX' },
            { type: 'card', label: 'Cartão' }
        ]
    },
    {
        id: 'picpay',
        name: 'PicPay',
        icon: 'fa-qrcode',
        status: 'coming_soon',
        methods: [
            { type: 'pix', label: 'PIX' },
            { type: 'card', label: 'Cartão' }
        ]
    }
];

export interface PaymentProviderConfig {
    providerId: string;
    clientId?: string; 
    clientSecret?: string;
    token?: string;
    isConnected: boolean;
    tokenExpiresAt?: number; 
}

export interface SyncPayTransaction {
    identifier: string;
    pixCode: string;
    amount: number;
    status: 'pending' | 'paid' | 'expired' | 'completed' | 'withdrawal';
    buyerId: string;
    sellerId: string;
    groupId: string;
    platformFee: number;
    ownerNet: number;
    timestamp: number;
    pixKey?: string;
}

export interface VipAccess {
    userId: string;
    groupId: string;
    status: 'active' | 'expired';
    purchaseDate: number;
    expiresAt?: number;
    transactionId: string;
}

export interface MarketingConfig {
    pixelId?: string;
    pixelToken?: string;
}

export interface NotificationSettings {
    pauseAll: boolean;
    likes: boolean;
    comments: boolean;
    followers: boolean;
    mentions: boolean;
    messages: boolean;
    groups: boolean;
    marketplace: boolean;
    emailUpdates: boolean;
    emailDigest: boolean;
}

export interface SecuritySettings {
    saveLoginInfo: boolean;
}


const { createRepositoryProxy } = require('../../services/audit/repositoryLoggerProxy');
const { trafficLogger } = require('../../services/audit/trafficLogger');

// Importa os repositórios originais
const AdAnalyticsRepository = require('./AdAnalyticsRepository');
const AdRepository = require('./AdRepository');
const AdminStatsRepository = require('./AdminStatsRepository');
const AggregatorRepository = require('./AggregatorRepository');
const AnalyticsRepository = require('./AnalyticsRepository');
const AuditRepository = require('./AuditRepository');
const ChatRepository = require('./ChatRepository');
const CommentRepository = require('./CommentRepository');
const CredentialsRepository = require('./CredentialsRepository');
const FinancialAnalyticsRepository = require('./FinancialAnalyticsRepository');
const FinancialRepository = require('./FinancialRepository');
const GroupRepository = require('./GroupRepository');
const InteractionRepository = require('./InteractionRepository');
const MarketplaceRepository = require('./MarketplaceRepository');
const NotificationRepository = require('./NotificationRepository');
const PaymentRepository = require('./PaymentRepository');
const PostRepository = require('./PostRepository');
const ReelsRepository = require('./ReelsRepository');
const RelationshipRepository = require('./RelationshipRepository');
const ReportRepository = require('./ReportRepository');
const UserAnalyticsRepository = require('./UserAnalyticsRepository');
const UserRepository = require('./UserRepository');
const FeeRepository = require('./financial/FeeRepository');
const GroupRankingRepository = require('./ranking/GroupRankingRepository');

// Cria e exporta os repositórios com proxy
module.exports = {
    AdAnalyticsRepository: createRepositoryProxy(AdAnalyticsRepository, trafficLogger, 'AdAnalyticsRepository'),
    AdRepository: createRepositoryProxy(AdRepository, trafficLogger, 'AdRepository'),
    AdminStatsRepository: createRepositoryProxy(AdminStatsRepository, trafficLogger, 'AdminStatsRepository'),
    AggregatorRepository: createRepositoryProxy(AggregatorRepository, trafficLogger, 'AggregatorRepository'),
    AnalyticsRepository: createRepositoryProxy(AnalyticsRepository, trafficLogger, 'AnalyticsRepository'),
    AuditRepository: createRepositoryProxy(AuditRepository, trafficLogger, 'AuditRepository'),
    ChatRepository: createRepositoryProxy(ChatRepository, trafficLogger, 'ChatRepository'),
    CommentRepository: createRepositoryProxy(CommentRepository, trafficLogger, 'CommentRepository'),
    CredentialsRepository: createRepositoryProxy(CredentialsRepository, trafficLogger, 'CredentialsRepository'),
    FinancialAnalyticsRepository: createRepositoryProxy(FinancialAnalyticsRepository, trafficLogger, 'FinancialAnalyticsRepository'),
    FinancialRepository: createRepositoryProxy(FinancialRepository, trafficLogger, 'FinancialRepository'),
    GroupRepository: createRepositoryProxy(GroupRepository, trafficLogger, 'GroupRepository'),
    InteractionRepository: createRepositoryProxy(InteractionRepository, trafficLogger, 'InteractionRepository'),
    MarketplaceRepository: createRepositoryProxy(MarketplaceRepository, trafficLogger, 'MarketplaceRepository'),
    NotificationRepository: createRepositoryProxy(NotificationRepository, trafficLogger, 'NotificationRepository'),
    PaymentRepository: createRepositoryProxy(PaymentRepository, trafficLogger, 'PaymentRepository'),
    PostRepository: createRepositoryProxy(PostRepository, trafficLogger, 'PostRepository'),
    ReelsRepository: createRepositoryProxy(ReelsRepository, trafficLogger, 'ReelsRepository'),
    RelationshipRepository: createRepositoryProxy(RelationshipRepository, trafficLogger, 'RelationshipRepository'),
    ReportRepository: createRepositoryProxy(ReportRepository, trafficLogger, 'ReportRepository'),
    UserAnalyticsRepository: createRepositoryProxy(UserAnalyticsRepository, trafficLogger, 'UserAnalyticsRepository'),
    UserRepository: createRepositoryProxy(UserRepository, trafficLogger, 'UserRepository'),
    FeeRepository: createRepositoryProxy(FeeRepository, trafficLogger, 'FeeRepository'),
    GroupRankingRepository: createRepositoryProxy(GroupRankingRepository, trafficLogger, 'GroupRankingRepository'),
};

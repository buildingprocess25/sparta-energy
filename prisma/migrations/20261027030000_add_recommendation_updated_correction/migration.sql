-- Additive only: validation logs the recommendation it replaces when the status flips.
ALTER TYPE "AuditCorrectionType" ADD VALUE 'RECOMMENDATION_UPDATED';

import mongoose, { Schema, Document } from "mongoose";

export interface IAuditLog extends Document {
  userId: string;
  email: string;
  action: string;
  details: string;
  ip: string;
  userAgent: string;
  createdAt: Date;
}

const auditLogSchema = new Schema(
  {
    userId: { type: String, required: true },
    email: { type: String, required: true },
    action: { type: String, required: true },
    details: { type: String, default: "" },
    ip: { type: String, default: "" },
    userAgent: { type: String, default: "" },
  },
  { timestamps: true }
);

export const AuditLogModel = mongoose.model<IAuditLog>("AuditLog", auditLogSchema);

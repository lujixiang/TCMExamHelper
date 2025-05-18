import mongoose, { Schema, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}

interface StudyProgress {
  completedQuestions: string[];
  lastStudyTime: Date;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  role: string;
  isActive: boolean;
  profile: {
    nickname?: string;
    avatar?: string;
  };
  stats: {
    totalQuestions: number;
    correctCount: number;
    wrongCount: number;
    streak: number;
    lastLoginAt: Date;
    lastAnswerAt: Date;
  };
  studyProgress: Map<string, Map<string, StudyProgress>>;
  lastLoginAt: Date;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

interface IUserDocument extends IUser {
  password: string;
}

const UserSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.USER
  },
  isActive: {
    type: Boolean,
    default: true
  },
  profile: {
    nickname: {
      type: String,
      default: ''
    },
    avatar: {
      type: String,
      default: ''
    }
  },
  stats: {
    totalQuestions: {
      type: Number,
      default: 0
    },
    correctCount: {
      type: Number,
      default: 0
    },
    wrongCount: {
      type: Number,
      default: 0
    },
    streak: {
      type: Number,
      default: 0
    },
    lastLoginAt: {
      type: Date,
      default: Date.now
    },
    lastAnswerAt: {
      type: Date,
      default: Date.now
    }
  },
  studyProgress: {
    type: Map,
    of: {
      type: Map,
      of: {
        completedQuestions: [String],
        lastStudyTime: Date
      }
    },
    default: new Map()
  },
  lastLoginAt: {
    type: Date,
    default: Date.now
  },
  name: {
    type: String,
    required: false,
    trim: true,
    default: function() {
      // @ts-ignore
      return this.username || '';
    }
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      return ret;
    }
  }
});

// 密码加密中间件
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// 密码比较方法
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', UserSchema);
export const UserModel = User; 
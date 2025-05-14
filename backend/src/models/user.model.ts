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
  password?: string;  // 密码字段可选
  role: UserRole;
  profile: {
    nickname: string;
    avatar: string;
  };
  stats: {
    totalQuestions: number;
    correctCount: number;
    wrongCount: number;
    streak: number;
    lastLoginDate: Date;
  };
  studyProgress: Map<string, Map<string, StudyProgress>>;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

interface IUserDocument extends IUser {
  password: string;
}

const UserSchema: Schema = new Schema({
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
    select: false // 默认不返回密码字段
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.USER
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
    lastLoginDate: {
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
  // 只有在密码被修改时才进行加密
  if (!this.isModified('password')) return next();

  try {
    // 生成盐值并加密密码
    const salt = await bcrypt.genSalt(10);
    const password = (this as any).password;
    if (typeof password === 'string') {
      (this as any).password = await bcrypt.hash(password, salt);
    }
    next();
  } catch (error) {
    next(error instanceof Error ? error : new Error('密码加密失败'));
  }
});

// 密码比较方法
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    const userPassword = (this as any).password;
    if (typeof userPassword !== 'string') {
      throw new Error('用户密码字段不存在');
    }
    return await bcrypt.compare(candidatePassword, userPassword);
  } catch (error) {
    console.error('密码比较失败:', error);
    return false;
  }
};

export const User = mongoose.model<IUser>('User', UserSchema); 
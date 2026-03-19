import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    name: {
      type: String,
      trim: true,
      default: '',
      maxlength: 60,
    },
    email: {
      type: String,
      trim: true,
      default: '',
      maxlength: 100,
    },
    region: {
      type: String,
      trim: true,
      default: '',
      maxlength: 60,
    },
    interestedGenres: {
      type: [String],
      default: [],
    },
    bio: {
      type: String,
      trim: true,
      default: '',
      maxlength: 300,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  },
);

export default mongoose.model('User', userSchema);
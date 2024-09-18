import { Schema, model, Document } from 'mongoose';

interface ICard extends Document {
    name: string;
    type: string;
}

const cardSchema = new Schema<ICard>({
    name: { type: String, required: true },
    type: { type: String, required: true },
});

const Card = model<ICard>('Card', cardSchema);

export default Card;
export { ICard }; 
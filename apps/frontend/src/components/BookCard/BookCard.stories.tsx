import type { Meta, StoryObj } from '@storybook/react';
import { BookCard } from './BookCard';
import type { Book } from '@domain/entities';

const meta: Meta<typeof BookCard> = {
	title: 'Biblioteca/BookCard',
	component: BookCard,
	tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof BookCard>;

// Datos Mocks 
const mockBookBase: Book = {
	id: 'b123',
	isbn: '978-1234567890',
	title: 'Cien años de soledad',
	author: 'Gabriel García Márquez',
	totalCopies: 5,
	availableCopies: 5,
};

// Historia 1: Disponible (Estado "Verde")
export const Available: Story = {
	args: {
		book: {
			...mockBookBase,
			availableCopies: 3,
		},
	},
};

// Historia 2: No Disponible (Estado "Rojo")
export const Unavailable: Story = {
	args: {
		book: {
			...mockBookBase,
			id: 'b456',
			availableCopies: 0,
		},
	},
};

// Historia 3: Solo una copia disponible
export const LowStock: Story = {
	args: {
		book: {
			...mockBookBase,
			id: 'b789',
			availableCopies: 1,
			title: 'El amor en los tiempos del cólera',
		},
	},
};
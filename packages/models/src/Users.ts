import { DataTypes, Model } from "d1-orm";

export const Users = new Model({
	tableName: "users",
	primaryKeys: ["id"],
}, {
	id: {
		type: DataTypes.TEXT,
		notNull: true,
	},
	name: {
		type: DataTypes.TEXT,
		notNull: true,
	},
	email: {
		type: DataTypes.TEXT,
		notNull: true,
	},
});
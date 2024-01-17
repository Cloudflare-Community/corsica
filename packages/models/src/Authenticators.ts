import { DataTypes, Model } from "d1-orm";

export const Authenticators = new Model({
	tableName: "authenticators",
	primaryKeys: ["credentialID"],
}, {
	credentialID: {
		type: DataTypes.BLOB,
		notNull: true,
	},
	user: {
		type: DataTypes.TEXT,
		notNull: true,
	},
	credentialPublicKey: {
		type: DataTypes.BLOB,
		notNull: true,
	},
	credentialDeviceType: {
		type: DataTypes.TEXT,
		notNull: true,
	},
	credentialBackedUp: {
		type: DataTypes.BOOLEAN,
		notNull: true,
	},
	transports: {
		// JSON String
		type: DataTypes.TEXT,
	}
});
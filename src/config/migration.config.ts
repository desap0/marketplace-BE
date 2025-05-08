import { DataSource } from 'typeorm';
import { OrmConfig } from './orm.config';

const datasource = new DataSource(OrmConfig); // config is one that is defined in datasource.config.ts file
datasource.initialize();
export default datasource;

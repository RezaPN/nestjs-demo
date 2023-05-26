import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from './report.entity'

@Module({
    imports: [TypeOrmModule.forFeature([Report])], 
    controllers: [ReportsController],
    providers: [ReportsController],
})
export class ReportsModule {}

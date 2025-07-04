/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

import { EChartsExtensionInstallRegisters } from '../../extension';
import SankeyView from './SankeyView';
import SankeySeriesModel from './SankeySeries';

import sankeyLayout from './sankeyLayout';
import sankeyVisual from './sankeyVisual';
import { Payload } from '../../util/types';
import GlobalModel from '../../model/Global';
import { updateCenterAndZoomInAction, RoamPayload } from '../../component/helper/roamHelper';
import type ExtensionAPI from '../../core/ExtensionAPI';

interface SankeyDragNodePayload extends Payload {
    localX: number
    localY: number
}

export function install(registers: EChartsExtensionInstallRegisters) {
    registers.registerChartView(SankeyView);
    registers.registerSeriesModel(SankeySeriesModel);

    registers.registerLayout(sankeyLayout);
    registers.registerVisual(sankeyVisual);

    registers.registerAction({
        type: 'dragNode',
        event: 'dragnode',
        // here can only use 'update' now, other value is not support in echarts.
        update: 'update'
    }, function (payload: SankeyDragNodePayload, ecModel: GlobalModel) {
        ecModel.eachComponent({
            mainType: 'series',
            subType: 'sankey',
            query: payload
        }, function (seriesModel: SankeySeriesModel) {
            seriesModel.setNodePosition(payload.dataIndex, [payload.localX, payload.localY]);
        });
    });

    registers.registerAction({
        type: 'sankeyRoam',
        event: 'sankeyRoam',
        update: 'none'
    }, function (payload: RoamPayload, ecModel: GlobalModel, api: ExtensionAPI) {
        ecModel.eachComponent({
            mainType: 'series', subType: 'sankey', query: payload
        }, function (seriesModel: SankeySeriesModel) {
            const coordSys = seriesModel.coordinateSystem;
            const res = updateCenterAndZoomInAction(coordSys, payload, seriesModel.get('scaleLimit'));

            seriesModel.setCenter(res.center);
            seriesModel.setZoom(res.zoom);
        });
    });
}

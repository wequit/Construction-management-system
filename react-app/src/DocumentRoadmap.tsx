import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs'
import cytoscape from 'cytoscape';
import type { Core, NodeSingular, EdgeSingular, EventObject } from 'cytoscape';
import { toast } from 'sonner'

import { mockProjects, getMockDocumentStatuses, getMockDocumentStatus } from './lib/data';

import { documentRoadmapModel, POSITIONS, POSITIONS_HORIZONTAL } from '@/entities/document-roadmap'
import type { RoadmapEdge, RoadmapStatus } from '@/entities/document-roadmap'
import './DocumentRoadmap.css';

interface Project {
  id: number;
  name: string;
  code?: string;
}

/** Маппинг id узла графа → section_code в API (backend init_roadmap_sections) */
const NODE_ID_TO_SECTION_CODE: Record<string, string> = {
  sketch: 'sketch',
  tu: 'sketch.itc',
  geo: 'sketch.geo',
  heat: 'sketch.itc.heat',
  power: 'sketch.itc.power',
  water: 'sketch.itc.water',
  gas: 'sketch.itc.gas',
  phone: 'sketch.itc.phone',
  urban: 'sketch.urban',
  workproj: 'working',
  genplan: 'working.genplan',
  ppr: 'working.ppr',
  act: 'working.survey',
  gpar: 'working.gp_ar',
  mchs: 'working.gp_ar.mchs',
  san: 'working.gp_ar.sanepid',
  eco: 'working.gp_ar.mpret',
  exp1: 'working.expertise.stage1',
  registry: 'working.register',
  exp2: 'working.expertise.stage2',
  engproj: 'working.networks',
  ext: 'working.networks.external',
  int: 'working.networks.internal',
  ext_heat: 'working.networks.external.heat',
  ext_power: 'working.networks.external.power',
  ext_water: 'working.networks.external.water',
  ext_gas: 'working.networks.external.gas',
  int_hv: 'working.networks.internal.hvac',
  int_el: 'working.networks.internal.electrical',
  int_vk: 'working.networks.internal.water',
  int_gas: 'working.networks.internal.gas',
  int_fire: 'working.networks.internal.fire',
};

/** Бэкенд: not_started | in_progress | on_approval | completed → фронт: not_started | in_progress | approval | done | blocked */
function apiExecutionStatusToFrontend(apiStatus: string): string {
  const map: Record<string, string> = {
    not_started: 'not_started',
    in_progress: 'in_progress',
    on_approval: 'approval',
    completed: 'done',
  };
  return map[apiStatus] ?? 'not_started';
}

/** Файл (ответ API /statuses/{id}/files) */
export interface RoadmapFileInfo {
  id: number;
  file_name: string;
  stored_path: string;
  file_size?: number;
  mime_type: string;
  uploaded_at: string;
  description?: string;
}

const STATUS: Record<string, { label: string; tag: string }> = {
  not_started: { label: 'Не начато', tag: 'info' },
  in_progress: { label: 'В работе', tag: 'warn' },
  approval: { label: 'На согласовании', tag: 'info' },
  done: { label: 'Выполнено', tag: 'ok' },
  blocked: { label: 'Блокирует', tag: 'danger' },
};

interface RoadmapNode {
  id: string;
  type?: string;
  text: string;
  stage: string;
  role: string;
  status: string;
  x: number;
  y: number;
  w?: number;
  h?: number;
}

const CRITICAL_PATH = new Set(['sketch', 'tu', 'urban', 'workproj', 'gpar', 'exp1', 'registry']);
const POSITIONS_STORAGE_KEY = 'roadmap-node-positions';

const CYTOSCAPE_STYLE = [
  { selector: 'node', style: {
    label: 'data(label)',
    'text-valign': 'center',
    'text-halign': 'center',
    'text-margin-y': 2,
    width: 'data(width)',
    height: 'data(height)',
    'background-color': '#e8ebf2',
    'background-opacity': 0.97,
    'border-width': 1.5,
    'border-color': '#c5cad8',
    'border-opacity': 1,
    shape: 'round-rectangle',
    'font-size': '13px',
    'font-family': 'Inter, Segoe UI, system-ui, sans-serif',
    color: '#2d3348',
    'text-wrap': 'wrap',
    'text-max-width': 'data(width)',
    'font-weight': '600',
    'overlay-opacity': 0,
    'text-outline-width': 0,
    'min-zoomed-font-size': 8,
  }},
  { selector: 'node[status="done"]', style: {
    'background-color': '#3f653e',
    'border-color': '#6ee7b7',
    color: '#ffffff',
  }},
  { selector: 'node[status="in_progress"]', style: {
    'background-color': '#f7e292',
    'border-color': '#fbbf24',
    color: 'black',
  }},
  { selector: 'node[status="not_started"]', style: {
    'background-color': '#ca4743',
    'border-color': '#fca5a5',
    color: '#ffffff',
  }},
  { selector: 'node[hidden="hidden"]', style: { 'visibility': 'hidden', 'events': 'no' }},
  { selector: 'node[offset="offset"]', style: { 'border-color': 'rgba(255,255,255,0.06)', 'shape': 'rectangle', 'events': 'no' }},
  { selector: 'node.selected', style: {
    'border-color': '#6366f1',
    'border-width': 3,
    'box-shadow': '0 0 20px rgba(99, 102, 241, 0.5)',
  }},
  { selector: 'node.dim', style: { opacity: 0.12 }},
  { selector: 'node.onPath', style: {
    'border-width': 2,
    'border-color': 'rgba(99, 102, 241, 0.4)',
  }},
  { selector: 'edge', style: {
    width: 2,
    'line-color': 'rgba(155, 165, 207, 0.3)',
    'target-arrow-color': 'rgba(155, 165, 207, 0.3)',
    'target-arrow-shape': '',
    'arrow-scale': 0.9,
    'line-opacity': 0.85,
  }},
  { selector: 'edge[type="mid"]', style: {
    'curve-style': 'round-taxi',
  }},
  { selector: 'edge[type="finish"]', style: {
    'curve-style': 'straight',
    'target-arrow-shape': 'triangle',
  }},
  { selector: 'edge.hi', style: {
    'line-color': 'rgba(99, 102, 241, 0.85)',
    'target-arrow-color': 'rgba(99, 102, 241, 0.85)',
    width: 3.5,
    'z-index': 999,
  }},
  { selector: 'edge.dim', style: { opacity: 0.05 }},
] as const;

const DocumentRoadmap: React.FC = () => {
  const { projectId } = useParams<{ projectId?: string }>();
  const [altRoadmap, setAltRoadmap] = useState(false)

  const NODES = useMemo<RoadmapNode[]>(() => [
    { id: 'sketch', text: 'Эскизный проект', stage: 'Исходные данные', role: 'Проектировщик', status: 'done', x: (altRoadmap ? POSITIONS_HORIZONTAL : POSITIONS).sketch.x, y: (altRoadmap ? POSITIONS_HORIZONTAL : POSITIONS).sketch.y, w: 200, h: 44 },
    { id: 'tu', text: 'Инженерные технические условия\n(выдается уполномоченным лицом в сфере архитектуры)', stage: 'Исходные данные', role: 'Архитектура', status: 'done', x: (altRoadmap ? POSITIONS_HORIZONTAL : POSITIONS).tu.x, y: (altRoadmap ? POSITIONS_HORIZONTAL : POSITIONS).tu.y, w: 350, h: 90 },
    { id: 'geo', text: 'Инженерные геологические\nизыскания', stage: 'Исходные данные', role: 'Геодезия/Геология', status: 'in_progress', x: (altRoadmap ? POSITIONS_HORIZONTAL : POSITIONS).geo.x, y: (altRoadmap ? POSITIONS_HORIZONTAL : POSITIONS).geo.y, w: 260, h: 74 },
    { id: 'heat', text: 'Теплоснабжение', stage: 'Инженерные сети (ТУ)', role: 'Инженер ОВ', status: 'in_progress', x: (altRoadmap ? POSITIONS_HORIZONTAL : POSITIONS).heat.x, y: (altRoadmap ? POSITIONS_HORIZONTAL : POSITIONS).heat.y, w: 160, h: 44 },
    { id: 'power', text: 'Электроснабжение', stage: 'Инженерные сети (ТУ)', role: 'Инженер ЭО', status: 'not_started', x: (altRoadmap ? POSITIONS_HORIZONTAL : POSITIONS).power.x, y: (altRoadmap ? POSITIONS_HORIZONTAL : POSITIONS).power.y, w: 170, h: 44 },
    { id: 'water', text: 'Водопровод и\nканализация', stage: 'Инженерные сети (ТУ)', role: 'Инженер ВК', status: 'in_progress', x: (altRoadmap ? POSITIONS_HORIZONTAL : POSITIONS).water.x, y: (altRoadmap ? POSITIONS_HORIZONTAL : POSITIONS).water.y, w: 210, h: 44 },
    { id: 'gas', text: 'Газоснабжение', stage: 'Инженерные сети (ТУ)', role: 'Инженер Газ', status: 'in_progress', x: (altRoadmap ? POSITIONS_HORIZONTAL : POSITIONS).gas.x, y: (altRoadmap ? POSITIONS_HORIZONTAL : POSITIONS).gas.y, w: 170, h: 44 },
    { id: 'phone', text: 'Телефонизация', stage: 'Инженерные сети (ТУ)', role: 'Инженер СС', status: 'not_started', x: (altRoadmap ? POSITIONS_HORIZONTAL : POSITIONS).phone.x, y: (altRoadmap ? POSITIONS_HORIZONTAL : POSITIONS).phone.y, w: 160, h: 44 },
    { id: 'urban', text: 'Градостроительное\nзаключение', stage: 'Проектирование', role: 'Архитектура', status: 'in_progress', x: (altRoadmap ? POSITIONS_HORIZONTAL : POSITIONS).urban.x, y: (altRoadmap ? POSITIONS_HORIZONTAL : POSITIONS).urban.y, w: 360, h: 44 },
    { id: 'workproj', text: 'Рабочий проект', stage: 'Проектирование', role: 'ГАП/ГИП', status: 'in_progress', x: (altRoadmap ? POSITIONS_HORIZONTAL : POSITIONS).workproj.x, y: (altRoadmap ? POSITIONS_HORIZONTAL : POSITIONS).workproj.y, w: 260, h: 44 },
    { id: 'genplan', text: 'Стройгенплан', stage: 'Проектирование', role: 'ПТО/Производство', status: 'not_started', x: (altRoadmap ? POSITIONS_HORIZONTAL : POSITIONS).genplan.x, y: (altRoadmap ? POSITIONS_HORIZONTAL : POSITIONS).genplan.y, w: 260, h: 44 },
    { id: 'ppr', text: 'ППР\nПлан производственных работ', stage: 'Проектирование', role: 'ПТО', status: 'not_started', x: (altRoadmap ? POSITIONS_HORIZONTAL : POSITIONS).ppr.x, y: (altRoadmap ? POSITIONS_HORIZONTAL : POSITIONS).ppr.y, w: 260, h: 58 },
    { id: 'act', text: 'Акт выноса\nв натуру', stage: 'Проектирование', role: 'Геодезия', status: 'in_progress', x: (altRoadmap ? POSITIONS_HORIZONTAL : POSITIONS).act.x, y: (altRoadmap ? POSITIONS_HORIZONTAL : POSITIONS).act.y, w: 260, h: 44 },
    { id: 'gpar', text: 'ГП АР\n(Генплан и Архитектурные решения)\nСогласование с Бишкекглавархитектурой', stage: 'Согласования', role: 'Архитектура', status: 'in_progress', x: (altRoadmap ? POSITIONS_HORIZONTAL : POSITIONS).gpar.x, y: (altRoadmap ? POSITIONS_HORIZONTAL : POSITIONS).gpar.y, w: 380, h: 74 },
    { id: 'mchs', text: 'Согласование\nс МЧС', stage: 'Согласования', role: 'Эксперт', status: 'not_started', x: (altRoadmap ? POSITIONS_HORIZONTAL : POSITIONS).mchs.x, y: (altRoadmap ? POSITIONS_HORIZONTAL : POSITIONS).mchs.y, w: 240, h: 44 },
    { id: 'san', text: 'Согласование\nс Санэпид', stage: 'Согласования', role: 'Эксперт', status: 'not_started', x: (altRoadmap ? POSITIONS_HORIZONTAL : POSITIONS).san.x, y: (altRoadmap ? POSITIONS_HORIZONTAL : POSITIONS).san.y, w: 240, h: 44 },
    { id: 'eco', text: 'Согласование\nс МПРЭТН (экология)', stage: 'Согласования', role: 'Эксперт', status: 'in_progress', x: (altRoadmap ? POSITIONS_HORIZONTAL : POSITIONS).eco.x, y: (altRoadmap ? POSITIONS_HORIZONTAL : POSITIONS).eco.y, w: 240, h: 52 },
    { id: 'exp1', text: 'Прохождение государственной экспертизы\n1 этап (Госэкспертизы)', stage: 'Экспертиза', role: 'Госэкспертиза', status: 'in_progress', x: (altRoadmap ? POSITIONS_HORIZONTAL : POSITIONS).exp1.x, y: (altRoadmap ? POSITIONS_HORIZONTAL : POSITIONS).exp1.y, w: 360, h: 54 },
    { id: 'registry', text: 'Включение в реестр\nстроящихся объектов', stage: 'Завершение', role: 'Регистратор', status: 'not_started', x: (altRoadmap ? POSITIONS_HORIZONTAL : POSITIONS).registry.x, y: (altRoadmap ? POSITIONS_HORIZONTAL : POSITIONS).registry.y, w: 360, h: 54 },
    { id: 'exp2', text: '2 этап Госэкспертизы', stage: 'Экспертиза', role: 'Госэкспертиза', status: 'not_started', x: (altRoadmap ? POSITIONS_HORIZONTAL : POSITIONS).exp2.x, y: (altRoadmap ? POSITIONS_HORIZONTAL : POSITIONS).exp2.y, w: 280, h: 54 },
    { id: 'engproj', text: 'Проекты\nИнженерные сети', stage: 'Проектирование', role: 'ГИП', status: 'in_progress', x: (altRoadmap ? POSITIONS_HORIZONTAL : POSITIONS).engproj.x, y: (altRoadmap ? POSITIONS_HORIZONTAL : POSITIONS).engproj.y, w: 280, h: 54 },
    { id: 'ext', text: 'Наружные сети', stage: 'Инженерные сети', role: 'Инженеры', status: 'not_started', x: (altRoadmap ? POSITIONS_HORIZONTAL : POSITIONS).ext.x, y: (altRoadmap ? POSITIONS_HORIZONTAL : POSITIONS).ext.y, w: 220, h: 44 },
    { id: 'int', text: 'Внутренние сети', stage: 'Инженерные сети', role: 'Инженеры', status: 'not_started', x: (altRoadmap ? POSITIONS_HORIZONTAL : POSITIONS).int.x, y: (altRoadmap ? POSITIONS_HORIZONTAL : POSITIONS).int.y, w: 220, h: 44 },
    { id: 'ext_heat', text: 'Теплоснабжение', stage: 'Наружные сети', role: 'ОВ', status: 'not_started', x: (altRoadmap ? POSITIONS_HORIZONTAL : POSITIONS).ext_heat.x, y: (altRoadmap ? POSITIONS_HORIZONTAL : POSITIONS).ext_heat.y, w: 200, h: 40 },
    { id: 'ext_power', text: 'Электроснабжение', stage: 'Наружные сети', role: 'ЭО', status: 'not_started', x: (altRoadmap ? POSITIONS_HORIZONTAL : POSITIONS).ext_power.x, y: (altRoadmap ? POSITIONS_HORIZONTAL : POSITIONS).ext_power.y, w: 200, h: 40 },
    { id: 'ext_water', text: 'Наружный водопровод\nи канализация', stage: 'Наружные сети', role: 'ВК', status: 'not_started', x: (altRoadmap ? POSITIONS_HORIZONTAL : POSITIONS).ext_water.x, y: (altRoadmap ? POSITIONS_HORIZONTAL : POSITIONS).ext_water.y, w: 200, h: 55 },
    { id: 'ext_gas', text: 'Газоснабжение', stage: 'Наружные сети', role: 'Газ', status: 'not_started', x: (altRoadmap ? POSITIONS_HORIZONTAL : POSITIONS).ext_gas.x, y: (altRoadmap ? POSITIONS_HORIZONTAL : POSITIONS).ext_gas.y, w: 200, h: 40 },
    { id: 'int_hv', text: 'Отопление и вентиляция', stage: 'Внутренние сети', role: 'ОВ', status: 'not_started', x: (altRoadmap ? POSITIONS_HORIZONTAL : POSITIONS).int_hv.x, y: (altRoadmap ? POSITIONS_HORIZONTAL : POSITIONS).int_hv.y, w: 200, h: 40 },
    { id: 'int_el', text: 'Электромонтаж\nи электрооборудование', stage: 'Внутренние сети', role: 'ЭО', status: 'not_started', x: (altRoadmap ? POSITIONS_HORIZONTAL : POSITIONS).int_el.x, y: (altRoadmap ? POSITIONS_HORIZONTAL : POSITIONS).int_el.y, w: 200, h: 55 },
    { id: 'int_vk', text: 'Водопровод\nи канализация', stage: 'Внутренние сети', role: 'ВК', status: 'not_started', x: (altRoadmap ? POSITIONS_HORIZONTAL : POSITIONS).int_vk.x, y: (altRoadmap ? POSITIONS_HORIZONTAL : POSITIONS).int_vk.y, w: 200, h: 40 },
    { id: 'int_gas', text: 'Газоснабжение', stage: 'Внутренние сети', role: 'ПБ', status: 'not_started', x: (altRoadmap ? POSITIONS_HORIZONTAL : POSITIONS).int_gas.x, y: (altRoadmap ? POSITIONS_HORIZONTAL : POSITIONS).int_gas.y, w: 200, h: 40 },
    { id: 'int_fire', text: 'Пожаротушение\nи сигнализация', stage: 'Внутренние сети', role: 'ПБ', status: 'not_started', x: (altRoadmap ? POSITIONS_HORIZONTAL : POSITIONS).int_fire.x, y: (altRoadmap ? POSITIONS_HORIZONTAL : POSITIONS).int_fire.y, w: 200, h: 40 },
  ], [altRoadmap])

  const EDGES = useMemo<RoadmapEdge[]>(() => [
    ...documentRoadmapModel.initEdges({from: 'sketch', to: 'tu', fromSide: altRoadmap ? 'right' : 'bottom', toSide: altRoadmap ? 'left' : 'top' }),
    ...documentRoadmapModel.initEdges({from: 'sketch', to: 'geo', fromSide: altRoadmap ? 'bottom' : 'right', toSide: altRoadmap ? 'left' : 'top' }),

    ...documentRoadmapModel.initEdges({from: 'tu', to: 'heat', fromSide: altRoadmap ? 'right' : 'bottom', toSide: altRoadmap ? 'left' : 'top' }),
    ...documentRoadmapModel.initEdges({from: 'tu', to: 'power', fromSide: altRoadmap ? 'right' : 'bottom', toSide: altRoadmap ? 'left' : 'top' }),
    ...documentRoadmapModel.initEdges({from: 'tu', to: 'water', fromSide: altRoadmap ? 'right' : 'bottom', toSide: altRoadmap ? 'left' : 'top' }),
    ...documentRoadmapModel.initEdges({from: 'tu', to: 'gas', fromSide: altRoadmap ? 'right' : 'bottom', toSide: altRoadmap ? 'left' : 'top' }),
    ...documentRoadmapModel.initEdges({from: 'tu', to: 'phone', fromSide: altRoadmap ? 'right' : 'bottom', toSide: altRoadmap ? 'left' : 'top' }),
    ...documentRoadmapModel.initEdges({from: 'tu', to: 'urban', fromSide: altRoadmap ? 'top' : 'bottom', toSide: altRoadmap ? 'top' : 'top' }),

    ...documentRoadmapModel.initEdges({from: 'heat', to: 'urban', fromSide: altRoadmap ? 'right' : 'bottom', toSide: altRoadmap ? 'left' : 'top' }),
    ...documentRoadmapModel.initEdges({from: 'power', to: 'urban', fromSide: altRoadmap ? 'right' : 'bottom', toSide: altRoadmap ? 'left' : 'top' }),
    ...documentRoadmapModel.initEdges({from: 'water', to: 'urban', fromSide: altRoadmap ? 'right' : 'bottom', toSide: altRoadmap ? 'left' : 'top' }),
    ...documentRoadmapModel.initEdges({from: 'gas', to: 'urban', fromSide: altRoadmap ? 'right' : 'bottom', toSide: altRoadmap ? 'left' : 'top' }),
    ...documentRoadmapModel.initEdges({from: 'phone', to: 'urban', fromSide: altRoadmap ? 'right' : 'bottom', toSide: altRoadmap ? 'left' : 'top' }),

    ...documentRoadmapModel.initEdges({from: 'urban', to: 'workproj', fromSide: altRoadmap ? 'right' : 'bottom', toSide: altRoadmap ? 'left' : 'top' }),
    ...documentRoadmapModel.initEdges({from: 'geo', to: 'workproj', fromSide: altRoadmap ? 'right' : 'bottom', toSide: altRoadmap ? 'bottom' : 'right' }),

    ...documentRoadmapModel.initEdges({from: 'workproj', to: 'genplan', fromSide: altRoadmap ? 'top' : 'left', toSide: altRoadmap ? 'left' : 'right' }),
    ...documentRoadmapModel.initEdges({from: 'workproj', to: 'ppr', fromSide: altRoadmap ? 'top' : 'left', toSide: altRoadmap ? 'left' : 'right' }),
    ...documentRoadmapModel.initEdges({from: 'workproj', to: 'act', fromSide: altRoadmap ? 'top' : 'left', toSide: altRoadmap ? 'left' : 'right' }),

    ...documentRoadmapModel.initEdges({from: 'gpar', to: 'mchs', fromSide: altRoadmap ? 'top' : 'right', toSide: altRoadmap ? 'left' : 'left' }),
    ...documentRoadmapModel.initEdges({from: 'gpar', to: 'san', fromSide: altRoadmap ? 'right' : 'right', toSide: altRoadmap ? 'bottom' : 'left' }),
    ...documentRoadmapModel.initEdges({from: 'gpar', to: 'eco', fromSide: altRoadmap ? 'bottom' : 'right', toSide: altRoadmap ? 'left' : 'left' }),
    ...documentRoadmapModel.initEdges({from: 'gpar', to: 'exp1', fromSide: altRoadmap ? 'top' : 'bottom', toSide: altRoadmap ? 'left' : 'top' }),

    ...documentRoadmapModel.initEdges({from: 'workproj', to: 'gpar', fromSide: altRoadmap ? 'right' : 'bottom', toSide: altRoadmap ? 'left' : 'top' }),
    ...documentRoadmapModel.initEdges({from: 'exp1', to: 'registry', fromSide: altRoadmap ? 'right' : 'bottom', toSide: altRoadmap ? 'left' : 'top' }),
    ...documentRoadmapModel.initEdges({from: 'exp1', to: 'exp2', fromSide: altRoadmap ? 'bottom' : 'left', toSide: altRoadmap ? 'top' : 'right' }),

    ...documentRoadmapModel.initEdges({from: 'exp2', to: 'engproj', fromSide: altRoadmap ? 'bottom' : 'bottom', toSide: altRoadmap ? 'top' : 'top' }),

    ...documentRoadmapModel.initEdges({from: 'engproj', to: 'ext', fromSide: altRoadmap ? 'bottom' : 'bottom', toSide: altRoadmap ? 'top' : 'top' }),
    ...documentRoadmapModel.initEdges({from: 'engproj', to: 'int', fromSide: altRoadmap ? 'bottom' : 'bottom', toSide: altRoadmap ? 'top' : 'top' }),

    ...documentRoadmapModel.initEdges({from: 'ext', to: 'ext_heat', fromSide: altRoadmap ? 'left' : 'left', toSide: altRoadmap ? 'left' : 'left' }),
    ...documentRoadmapModel.initEdges({from: 'ext', to: 'ext_power', fromSide: altRoadmap ? 'left' : 'left', toSide: altRoadmap ? 'left' : 'left' }),
    ...documentRoadmapModel.initEdges({from: 'ext', to: 'ext_water', fromSide: altRoadmap ? 'left' : 'left', toSide: altRoadmap ? 'left' : 'left' }),
    ...documentRoadmapModel.initEdges({from: 'ext', to: 'ext_gas', fromSide: altRoadmap ? 'left' : 'left', toSide: altRoadmap ? 'left' : 'left' }),

    ...documentRoadmapModel.initEdges({from: 'int', to: 'int_hv', fromSide: altRoadmap ? 'left' : 'left', toSide: altRoadmap ? 'left' : 'left' }),
    ...documentRoadmapModel.initEdges({from: 'int', to: 'int_el', fromSide: altRoadmap ? 'left' : 'left', toSide: altRoadmap ? 'left' : 'left' }),
    ...documentRoadmapModel.initEdges({from: 'int', to: 'int_vk', fromSide: altRoadmap ? 'left' : 'left', toSide: altRoadmap ? 'left' : 'left' }),
    ...documentRoadmapModel.initEdges({from: 'int', to: 'int_gas', fromSide: altRoadmap ? 'left' : 'left', toSide: altRoadmap ? 'left' : 'left' }),
    ...documentRoadmapModel.initEdges({from: 'int', to: 'int_fire', fromSide: altRoadmap ? 'left' : 'left', toSide: altRoadmap ? 'left' : 'left' }),
  ], [altRoadmap])

  const nodeById = useCallback((id: string): RoadmapNode | undefined => {
    return NODES.find((n) => n.id === id);
  }, [NODES])

  function edgesFrom(id: string): RoadmapEdge[] {
    const edges = EDGES.filter((e) => e.from === id);
    return edges;
  }
  function edgesTo(id: string): RoadmapEdge[] {
    const edges = EDGES.filter((e) => e.to === id);
    return edges;
  }
  function escapeHtml(s: string): string {
    return String(s).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m] || m));
  }

  const collectDependencies = useCallback((id: string): Set<string> => {
    // Собираем все связанные узлы (основной + anchors + offsets)
    const relatedNodes = new Set<string>([id]);
    NODES.forEach((node) => {
      if (node.id.startsWith(id + '_anchor_') || node.id.startsWith(id + '_offset_')) {
        relatedNodes.add(node.id);
      }
    });
    
    const seen = new Set<string>([id]);
    const stack = [id];
    
    // Добавляем все связанные узлы в стек для поиска входящих рёбер
    relatedNodes.forEach(nodeId => {
      if (nodeId !== id) {
        stack.push(nodeId);
      }
    });
    
    while (stack.length) {
      const cur = stack.pop()!;
      const incomingEdges = edgesTo(cur);
      const incoming = incomingEdges.map((e) => e.from);
      
      for (const src of incoming) {
        // Извлекаем базовое имя узла (без _anchor_ и _offset_)
        const baseNodeId = src.replace(/_anchor_.*$/, '').replace(/_offset_.*$/, '');
        
        if (!seen.has(baseNodeId)) {
          seen.add(baseNodeId);
          stack.push(src); // Добавляем сам узел для дальнейшего поиска
          
          // Также добавляем все anchor/offset узлы для этого базового узла
          NODES.forEach((node) => {
            if (node.id.startsWith(baseNodeId + '_anchor_') || node.id.startsWith(baseNodeId + '_offset_')) {
              stack.push(node.id);
            }
          });
        }
      }
    }
    return seen;
  }, [NODES, EDGES])

  const getEffectiveStatus = useCallback((nodeId: string, statusesBySection: Record<string, RoadmapStatus>): string => {
    const sectionCode = NODE_ID_TO_SECTION_CODE[nodeId];
    const node = NODES.find((n) => n.id === nodeId);
    const defaultStatus = node?.status ?? 'not_started';
    if (!sectionCode) return defaultStatus;
    const s = statusesBySection[sectionCode];
    return s ? apiExecutionStatusToFrontend(s.execution_status) : defaultStatus;
  }, [NODES])

  const cyContainerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoomVal, setZoomVal] = useState(100);
  const [searchQuery, setSearchQuery] = useState('');
  const [mode, setMode] = useState('all');
  const [statusFilter, setStatusFilter] = useState('any');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [statusesBySection, setStatusesBySection] = useState<Record<string, RoadmapStatus>>({});
  const [loadingStatuses, setLoadingStatuses] = useState(false);
  const [cardFiles, setCardFiles] = useState<RoadmapFileInfo[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  const selectedSectionCode = useMemo(() => {
    return selectedId ? (NODE_ID_TO_SECTION_CODE[selectedId] ?? null) : null
  }, [selectedId]);

  const selectedStatus = useMemo(() => {
    return selectedSectionCode != null ? statusesBySection[selectedSectionCode] : null
  }, [selectedSectionCode, statusesBySection]);

  const mockStatusForCard = useMemo(() => {
    return selectedSectionCode != null && selectedProjectId != null
      ? getMockDocumentStatus(selectedSectionCode, selectedProjectId)
      : undefined
  }, [selectedSectionCode, selectedProjectId]);

  const effectiveStatusForSelected = useMemo(() => {
    return selectedId ? getEffectiveStatus(selectedId, statusesBySection) : null
  }, [selectedId, statusesBySection, getEffectiveStatus]);


  const API_URL = 'http://77.95.56.125:7002/api/v1';
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(`${API_URL}/projects/`);
        const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
        const list = data.filter((p: Project) => p && p.id).map((p: any) => ({ id: p.id, name: p.name, code: p.code }));
        if (list.length > 0) {
          setProjects(list);
          // Если projectId передан в URL, используем его, иначе первый проект
          const urlProjectId = projectId ? Number(projectId) : null;
          const targetProjectId = urlProjectId && list.find((p: Project) => p.id === urlProjectId) 
            ? urlProjectId 
            : (list[0]?.id ?? null);
          setSelectedProjectId(targetProjectId);
        } else {
          setProjects(mockProjects as Project[]);
          const urlProjectId = projectId ? Number(projectId) : null;
          const targetProjectId = urlProjectId && mockProjects.find((p: Project) => p.id === urlProjectId)
            ? urlProjectId
            : (mockProjects[0]?.id ?? null);
          setSelectedProjectId(targetProjectId);
        }
      } catch {
        setProjects(mockProjects as Project[]);
        const urlProjectId = projectId ? Number(projectId) : null;
        const targetProjectId = urlProjectId && mockProjects.find(p => p.id === urlProjectId)
          ? urlProjectId
          : (mockProjects[0]?.id ?? null);
        setSelectedProjectId(targetProjectId);
      }
    };
    fetchProjects();
  }, [projectId]);

  useEffect(() => {
    if (!selectedProjectId) {
      setStatusesBySection({});
      setSelectedId(null);
      return;
    }
    setSelectedId(null);
    let cancelled = false;
    setLoadingStatuses(true);
    (async () => {
      try {
        const response = await axios.post<RoadmapStatus[]>(
          `${API_URL}/document-roadmap/projects/${selectedProjectId}/init-statuses`
        );
        const list = Array.isArray(response.data) ? response.data : [];
        if (!cancelled) {
          const bySection: Record<string, RoadmapStatus> = {};
          list.forEach((s) => {
            bySection[s.section_code] = s;
          });
          setStatusesBySection(bySection);
        }
      } catch {
        try {
          const fallback = await axios.get<RoadmapStatus[]>(`${API_URL}/document-roadmap/statuses/`, {
            params: { project_id: selectedProjectId },
          });
          const list = Array.isArray(fallback.data) ? fallback.data : [];
          if (!cancelled) {
            const bySection: Record<string, RoadmapStatus> = {};
            list.forEach((s) => {
              bySection[s.section_code] = s;
            });
            setStatusesBySection(bySection);
          }
        } catch {
          if (!cancelled) {
            const mockList = getMockDocumentStatuses(selectedProjectId) as RoadmapStatus[];
            const bySection: Record<string, RoadmapStatus> = {};
            mockList.forEach((s) => {
              bySection[s.section_code] = s;
            });
            setStatusesBySection(bySection);
          }
        }
      } finally {
        if (!cancelled) setLoadingStatuses(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedProjectId]);

  const fetchCardFiles = useCallback(async (statusId: number) => {
    setLoadingFiles(true);
    try {
      const response = await axios.get<RoadmapFileInfo[]>(`${API_URL}/document-roadmap/statuses/${statusId}/files`);
      setCardFiles(Array.isArray(response.data) ? response.data : []);
    } catch {
      setCardFiles([]);
    } finally {
      setLoadingFiles(false);
    }
  }, []);

  useEffect(() => {
    if (selectedStatus?.id) fetchCardFiles(selectedStatus.id);
    else setCardFiles([]);
  }, [selectedStatus?.id, fetchCardFiles]);

  const handleUploadFile = useCallback(
    async (file: File) => {
      if (!selectedStatus?.id) return;
      if (file.type !== 'application/pdf') {
        window.alert('Разрешена загрузка только PDF.');
        return;
      }
      setUploadingFile(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        await axios.post(`${API_URL}/document-roadmap/statuses/${selectedStatus.id}/files`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        await fetchCardFiles(selectedStatus.id);
      } catch {
        window.alert('Не удалось загрузить файл.');
      } finally {
        setUploadingFile(false);
      }
    },
    [selectedStatus?.id, fetchCardFiles]
  );

  const handleDeleteFile = useCallback(
    async (fileId: number) => {
      if (!selectedStatus?.id) return;
      if (!window.confirm('Удалить файл?')) return;
      try {
        await axios.delete(`${API_URL}/document-roadmap/files/${fileId}`);
        await fetchCardFiles(selectedStatus.id);
      } catch {
        window.alert('Не удалось удалить файл.');
      }
    },
    [selectedStatus?.id, fetchCardFiles]
  );

  const creatingStatusRef = useRef<string | null>(null);

  useEffect(() => {
    if (!selectedProjectId || !selectedSectionCode || selectedStatus || !selectedId || selectedId === 'title') {
      return;
    }
    if (creatingStatusRef.current === selectedSectionCode) return;
    creatingStatusRef.current = selectedSectionCode;
    (async () => {
      try {
        await axios.get<RoadmapStatus>(`${API_URL}/document-roadmap/statuses/`, {
          params: {
            project_id: selectedProjectId,
            section_code: selectedSectionCode,
            execution_status: 'not_started',
          }
        });
        setStatusesBySection((prev) => ({ ...prev }));
      } catch (err) {
        console.error(err);
      } finally {
        creatingStatusRef.current = null;
      }
    })();
  }, [selectedProjectId, selectedSectionCode, selectedStatus, selectedId]);

  useEffect(() => {
    if (!cyRef.current) return;
    cyRef.current.nodes().forEach((n: NodeSingular) => {
      const id = n.id();
      const status = getEffectiveStatus(id, statusesBySection);
      (n as unknown as { data: (key: string, value?: string) => void }).data('status', status);
    });
    const cy = cyRef.current as unknown as { style: () => { update: () => void } };
    if (cy.style?.().update) cy.style().update();
    applyFilters();
    updateHighlights();
  }, [statusesBySection]); // eslint-disable-line react-hooks/exhaustive-deps

  const getSavedPositions = useCallback((): Record<string, { x: number; y: number }> => {
    try {
      const raw = localStorage.getItem(POSITIONS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }, []);

  const savePositions = useCallback(() => {
    if (!cyRef.current) return;
    const positions: Record<string, { x: number; y: number }> = {};
    cyRef.current.nodes().forEach((n: NodeSingular) => {
      const p = n.position();
      positions[n.id()] = { x: p.x, y: p.y };
    });
    try {
      localStorage.setItem(POSITIONS_STORAGE_KEY, JSON.stringify(positions));
    } catch {
      /* ignore */
    }
  }, []);

  const buildElements = useCallback(() => {
    const saved = getSavedPositions();
    const cyNodes = NODES.map((n) => {
      const label = (n.text || '').split('\n').map((s) => s.trim()).filter(Boolean).join('\n');
      const w = n.w || 160;
      const h = n.h || 44;
      const defaultPos = { x: n.x + w / 2, y: n.y + h / 2 };
      const position =
        saved[n.id] && typeof saved[n.id].x === 'number' && typeof saved[n.id].y === 'number'
          ? { x: saved[n.id].x, y: saved[n.id].y }
          : defaultPos;
      const status = getEffectiveStatus(n.id, statusesBySection);

      const node = {
        group: 'nodes' as const,
        data: {
          id: n.id,
          label,
          width: w,
          height: h,
          status: status || '',
          type: n.type || '',
          stage: n.stage || '',
          role: n.role || '',
        },
        position,
      };

      const sides = ['top', 'right', 'bottom', 'left']
      const anchors = sides.map((side) => {
        return {
          group: 'nodes' as const,
          data: {
            id: `${n.id}_anchor_${side}`,
            label: '',
            width: 0.1,
            height: 0.1,
            status: '',
            type: '',
            stage: '',
            role: '',
            hidden: 'hidden',
          },
          position: documentRoadmapModel.pointOnSide(n.x, n.y, n.w ?? 0, n.h ?? 0, side)
        }
      })

      const offsets = sides.map((side) => {
        return {
          group: 'nodes' as const,
          data: {
            id: `${n.id}_offset_${side}`,
            label: '',
            width: 1,
            height: 0.5,
            status: '',
            type: '',
            stage: '',
            role: '',
            offset: 'offset',
          },
          position: documentRoadmapModel.pointOnSideOffset(
            documentRoadmapModel.pointOnSide(n.x, n.y, n.w ?? 0, n.h ?? 0, side).x,
            documentRoadmapModel.pointOnSide(n.x, n.y, n.w ?? 0, n.h ?? 0, side).y,
            side
          )
        }
      })

      const anchorsAndOffsets = [...anchors, ...offsets]
        .filter(value => EDGES.some(edge => [edge.from, edge.to].includes(value.data.id)))

      return [...anchorsAndOffsets, node]
    })
    .flat();

    const cyEdges = EDGES.map((e, i) => ({
      group: 'edges' as const,
      data: { id: 'e' + i, source: e.from, target: e.to, type: e.type },
    }));
    return { nodes: cyNodes, edges: cyEdges };
  }, [NODES, EDGES, getSavedPositions, getEffectiveStatus, statusesBySection]);

  const applyFilters = useCallback(() => {
    if (!cyRef.current) return;
    const q = searchQuery.trim().toLowerCase();
    const st = statusFilter;
    const visible = new Set<string>();
    NODES.forEach((n) => {
      const nodeStatus = getEffectiveStatus(n.id, statusesBySection);
      let ok = true;
      if (q && n.type !== 'title') ok = n.text.toLowerCase().includes(q);
      if (ok && st !== 'any' && n.type !== 'title') ok = nodeStatus === st;
      if (ok && mode === 'critical' && n.type !== 'title') ok = CRITICAL_PATH.has(n.id);
      if (ok) visible.add(n.id);
    });
    cyRef.current.nodes().forEach((n: NodeSingular) => {
      const id = n.id()

      const anchorEnd = id.indexOf('_anchor')
      const offsetEnd = id.indexOf('_offset')

      if (anchorEnd !== -1 || offsetEnd !== -1) {
        const origId = id.slice(0, anchorEnd === -1 ? offsetEnd : anchorEnd)

        if (visible.has(origId)) {
          visible.add(id)
        }
      }

      n.style('display', visible.has(id) ? 'element' : 'none');
    });
    cyRef.current.edges().forEach((e: EdgeSingular) => {
      const f = e.source().id();
      const t = e.target().id();
      e.style('display', visible.has(f) && visible.has(t) ? 'element' : 'none');
    });
  }, [NODES, searchQuery, mode, statusFilter, statusesBySection, getEffectiveStatus]);

  const updateHighlights = useCallback(() => {
    if (!cyRef.current) return;
    cyRef.current.nodes().removeClass('selected dim onPath');
    cyRef.current.edges().removeClass('hi dim');
    applyFilters();
    if (!selectedId) return;
    
    const pathToSelected = collectDependencies(selectedId);
    
    // Расширяем путь: добавляем все anchor/offset узлы для узлов в пути
    const expandedPath = new Set<string>(pathToSelected);
    pathToSelected.forEach(baseId => {
      NODES.forEach(node => {
        if (node.id.startsWith(baseId + '_anchor_') || node.id.startsWith(baseId + '_offset_')) {
          expandedPath.add(node.id);
        }
      });
    });
    
    cyRef.current.nodes().forEach((n: NodeSingular) => {
      const id = n.id();
      // Определяем базовый ID (без anchor/offset)
      const baseId = id.replace(/_anchor_.*$/, '').replace(/_offset_.*$/, '');
      
      if (!expandedPath.has(id) && !pathToSelected.has(baseId)) {
        n.addClass('dim');
      } else if (id === selectedId) {
        n.addClass('selected');
      } else {
        n.addClass('onPath');
      }
    });
    
    cyRef.current.edges().forEach((e: EdgeSingular) => {
      const f = e.source().id();
      const t = e.target().id();
      
      // Проверяем базовые ID
      const fBase = f.replace(/_anchor_.*$/, '').replace(/_offset_.*$/, '');
      const tBase = t.replace(/_anchor_.*$/, '').replace(/_offset_.*$/, '');
      
      const onPath = (expandedPath.has(f) || pathToSelected.has(fBase)) && 
                     (expandedPath.has(t) || pathToSelected.has(tBase));
      
      if (!onPath) {
        e.addClass('dim');
      } else {
        e.addClass('hi');
      }
    });
  }, [selectedId, applyFilters, collectDependencies, NODES]);

  const selectNode = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedId(null);
  }, []);

  useEffect(() => {
    updateHighlights();
  }, [updateHighlights]);

  const fitCy = useCallback(() => {
    if (!cyRef.current) return;
    const cy = cyRef.current as unknown as { elements: (selector: string) => { length: number }; fit: (eles: unknown, padding: number) => void; zoom: () => number };
    const visible = cy.elements(':visible');
    cy.fit(visible.length > 0 ? visible : undefined, 28);
    setZoomVal(Math.round((cyRef.current.zoom() ?? 1) * 100));
  }, []);

  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setMode('all');
    setStatusFilter('any');
    clearSelection();
    setTimeout(() => {
      applyFilters();
      updateHighlights();
      fitCy();
    }, 0);
  }, [clearSelection, applyFilters, updateHighlights, fitCy]);

  const resetPositions = useCallback(() => {
    try {
      localStorage.removeItem(POSITIONS_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    if (cyContainerRef.current && cyRef.current) {
      cyRef.current.destroy();
      cyRef.current = null;
    }
    const { nodes: cyNodes, edges: cyEdges } = buildElements();
    if (cyContainerRef.current) {
      cyRef.current = cytoscape({
        container: cyContainerRef.current,
        elements: { nodes: cyNodes, edges: cyEdges },
        style: CYTOSCAPE_STYLE as any,
        layout: { name: 'preset' },
        minZoom: 0.35,
        maxZoom: 2,
        wheelSensitivity: 0.9,
        // @ts-ignore
        autolock: true,
        // @ts-ignore - улучшение качества рендеринга
        pixelRatio: 'auto',
        textureOnViewport: false,
        hideEdgesOnViewport: false,
        hideLabelsOnViewport: false,
        motionBlur: false,
      });
      cyRef.current.on('tap', 'node', (evt: EventObject) => selectNode((evt.target as NodeSingular).id()));
      cyRef.current.on('tap', (evt: EventObject) => {
        if (evt.target === cyRef.current) clearSelection();
      });
      cyRef.current.on('zoom pan', () => {
        const currentZoom = cyRef.current?.zoom() ?? 1;
        // Принудительно ограничиваем зум
        if (currentZoom < 0.35) {
          (cyRef.current as unknown as { zoom: (level: number) => void }).zoom(0.35);
        } else if (currentZoom > 2) {
          (cyRef.current as unknown as { zoom: (level: number) => void }).zoom(2);
        }
        setZoomVal(Math.round((cyRef.current?.zoom() ?? 1) * 100));
      });
      cyRef.current.on('free', 'node', savePositions);
      cyRef.current.fit(undefined, 28);
      setZoomVal(Math.round((cyRef.current?.zoom() ?? 1) * 100));
      applyFilters();
      updateHighlights();
    }
  }, [buildElements, selectNode, clearSelection, savePositions, applyFilters, updateHighlights]);

  useEffect(() => {
    if (!cyContainerRef.current) return;
    const { nodes: cyNodes, edges: cyEdges } = buildElements();
    cyRef.current = cytoscape({
      container: cyContainerRef.current,
      elements: { nodes: cyNodes, edges: cyEdges },
      style: CYTOSCAPE_STYLE as any,
      layout: { name: 'preset' },
      minZoom: 0.35,
      maxZoom: 2,
      wheelSensitivity: 0.9,
      // @ts-ignore
      autolock: true,
      // @ts-ignore - улучшение качества рендеринга
      pixelRatio: 'auto',
      textureOnViewport: false,
      hideEdgesOnViewport: false,
      hideLabelsOnViewport: false,
      motionBlur: false,
    });
    cyRef.current.on('tap', 'node', (evt: EventObject) => selectNode((evt.target as NodeSingular).id()));
    cyRef.current.on('tap', (evt: EventObject) => {
      if (evt.target === cyRef.current) clearSelection();
    });
    cyRef.current.on('zoom pan', () => {
      const currentZoom = cyRef.current?.zoom() ?? 1;
      // Принудительно ограничиваем зум
      if (currentZoom < 0.35) {
        (cyRef.current as unknown as { zoom: (level: number) => void }).zoom(0.35);
      } else if (currentZoom > 2) {
        (cyRef.current as unknown as { zoom: (level: number) => void }).zoom(2);
      }
      setZoomVal(Math.round((cyRef.current?.zoom() ?? 1) * 100));
    });
    cyRef.current.on('free', 'node', savePositions);
    cyRef.current.fit(undefined, 28);
    setZoomVal(Math.round((cyRef.current?.zoom() ?? 1) * 100));
    applyFilters();
    updateHighlights();

    const onResize = () => {
      if (cyRef.current) {
        cyRef.current.resize();
        cyRef.current.fit(undefined, 28);
      }
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    applyFilters();
    updateHighlights();
  }, [searchQuery, mode, statusFilter, applyFilters, updateHighlights]);

  const handleStatusChipClick = (status: string) => {
    setStatusFilter(status);
    setMode('all');
  };

  const handlePrint = () => window.print();
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') clearSelection();
  };

  const selectedNode = useMemo(() => selectedId ? nodeById(selectedId) : null, [selectedId, nodeById]);
  const deps = useMemo(() => selectedId ? edgesTo(selectedId).map((e) => nodeById(e.from)).filter(Boolean) as RoadmapNode[] : [], [selectedId]);
  const outs = useMemo(() => selectedId ? edgesFrom(selectedId).map((e) => nodeById(e.to)).filter(Boolean) as RoadmapNode[] : [], [selectedId]);
  const blockers = useMemo(() => selectedNode ? deps.filter((d) => getEffectiveStatus(d.id, statusesBySection) !== 'done') : [], [selectedNode, deps, statusesBySection]);
  const whyText = useMemo(() => !selectedId
    ? 'Выберите блок, чтобы увидеть "почему стоим": какие входящие зависимости не завершены и что они блокируют.'
    : blockers.length === 0
      ? `${(selectedNode?.text ?? '').split('\n')[0]}: входящие зависимости закрыты.`
      : `${(selectedNode?.text ?? '').split('\n')[0]} "стоит", потому что не закрыты зависимости: ${blockers.map((b) => `${b.text.split('\n')[0]} — ${STATUS[getEffectiveStatus(b.id, statusesBySection)]?.label || getEffectiveStatus(b.id, statusesBySection)}`).join('; ')}`
    , [selectedId, selectedNode, blockers, statusesBySection, getEffectiveStatus]);

  useEffect(() => {
    resetPositions()
  }, [altRoadmap])

  useEffect(() => {
    const dueDate = selectedStatus?.due_date ?? mockStatusForCard?.due_date
    if (!dueDate) return

    const today = dayjs()

    if (today.isAfter(dayjs(dueDate))) {
      toast.warning('Срок истек')
    }

  }, [selectedStatus, mockStatusForCard])

  return (
    <>
      <div className="documentRoadmapPage" onKeyDown={handleKeyDown} tabIndex={0}>
        <section className={`canvas ${selectedId ? 'withSidebar' : ''}`}>
          <div className="canvasHead">
            <div className="canvasHeadRow">
              <div className="t">
                Дорожная карта документов
                {selectedProjectId && (() => {
                  const p = projects.find((pr) => pr.id === selectedProjectId);
                  return p ? <><br />по проекту: {p.name}</> : null;
                })()}
              </div>
              <div className="seg" id="statusChips">
                {[
                  { status: 'any', label: 'Все', cls: '' },
                  { status: 'done', label: 'Выполнено', cls: 'ok' },
                  { status: 'in_progress', label: 'В работе', cls: 'warn' },
                  { status: 'not_started', label: 'Не начато', cls: 'danger' },
                ].map(({ status, label, cls }) => (
                  <div
                    key={status}
                    className={`chip ${cls} ${statusFilter === status ? 'active' : ''}`}
                    data-status={status}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleStatusChipClick(status)}
                    onKeyDown={(e) => e.key === 'Enter' && handleStatusChipClick(status)}
                    title={`Фильтр: ${label}`}
                  >
                    <span className="dot" />
                    {label}
                  </div>
                ))}
              </div>
              <div className="zoomPills zoomPillsHead">
                {loadingStatuses && <span className="pill muted" style={{ marginRight: 8 }}>Загрузка…</span>}

                <div>
                  Альт. схема

                  <input
                    type="checkbox"
                    checked={altRoadmap}
                    style={{ marginLeft: '1rem' }}
                    onChange={(e) => {
                      setAltRoadmap(e.target.checked)
                    }}
                  />
                </div>

                <select
                  className="projectSelectHead"
                  value={selectedProjectId ?? ''}
                  onChange={(e) => setSelectedProjectId(e.target.value ? Number(e.target.value) : null)}
                  aria-label="Выберите проект"
                  disabled={loadingStatuses}
                >
                  <option value="">Выберите проект</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.code ? `(${p.code})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="viewportContainer">
            <div className="viewport">
              <div ref={cyContainerRef} style={{ width: '100%', height: '100%', minHeight: 320 }} aria-label="Схема дорожной карты" />
            </div>
          </div>

          <div className="canvasFooter">
            <div className="canvasFooterFilters">
              <div className="footerLeft">
                <div className="field fieldSearch">
                  <label htmlFor="roadmap-search">Поиск</label>
                  <input id="roadmap-search" type="text" placeholder="Поиск" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <div className="field">
                  <label htmlFor="roadmap-mode">Показывать</label>
                  <select id="roadmap-mode" value={mode} onChange={(e) => setMode(e.target.value)}>
                    <option value="all">Все блоки</option>
                    <option value="critical">Критический путь (до Реестра)</option>
                  </select>
                </div>
                <div className="btnRow">
                  <button type="button" className="btn" onClick={fitCy}>
                    Fit
                  </button>
                  <button type="button" className="btn" onClick={resetFilters}>
                    Сброс
                  </button>
                  <button type="button" className="btn" onClick={handlePrint}>
                    Печать
                  </button>
                </div>
              </div>
              <div className="footerRightGroup">
                <div className="footerRight">
                  <button type="button" className="btn" onClick={resetPositions} title="Вернуть блоки в начальные позиции">
                    Сбросить позиции схемы
                  </button>
                </div>
                <div className="zoomPills">
                  <div className="pill">
                    Zoom: <b>{zoomVal}%</b>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {selectedId && (
          <>
          <div className="mobileBackdrop" onClick={clearSelection} />
          <div className="cardPopup" role="dialog" aria-labelledby="cardPopupTitle" aria-modal="false">
            <div className="cardPopupHead">
              <div className="t" id="cardPopupTitle">
                <span style={{ opacity: 0.5, marginRight: 6 }}>◆</span>
                Карточка блока
              </div>
              <button type="button" className="cardPopupClose" onClick={clearSelection} title="Закрыть" aria-label="Закрыть">
                ✕
              </button>
            </div>
            <div className="cardPopupBody">
              {selectedNode ? (
                <>
                  <div className="kv">
                    <div className="k">Название</div>
                    <div className="v" style={{ fontWeight: 600 }}>{escapeHtml((selectedNode?.text ?? '').split('\n')[0])}</div>
                    <div className="k">Статус</div>
                    <div className="v">
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '4px 12px',
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 600,
                        background: effectiveStatusForSelected === 'done' ? '#d1fae5' : effectiveStatusForSelected === 'in_progress' ? '#fef3c7' : effectiveStatusForSelected === 'not_started' ? '#fee2e2' : 'rgba(96,165,250,.10)',
                        color: effectiveStatusForSelected === 'done' ? '#065f46' : effectiveStatusForSelected === 'in_progress' ? '#78350f' : effectiveStatusForSelected === 'not_started' ? '#7f1d1d' : '#93c5fd',
                        border: `1px solid ${effectiveStatusForSelected === 'done' ? '#6ee7b7' : effectiveStatusForSelected === 'in_progress' ? '#fbbf24' : effectiveStatusForSelected === 'not_started' ? '#fca5a5' : 'rgba(96,165,250,.20)'}`,
                      }}>
                        <span style={{
                          width: 7, height: 7, borderRadius: '50%',
                          background: effectiveStatusForSelected === 'done' ? '#10b981' : effectiveStatusForSelected === 'in_progress' ? '#f59e0b' : effectiveStatusForSelected === 'not_started' ? '#ef4444' : '#60a5fa',
                          boxShadow: `0 0 6px ${effectiveStatusForSelected === 'done' ? 'rgba(16,185,129,.4)' : effectiveStatusForSelected === 'in_progress' ? 'rgba(245,158,11,.4)' : effectiveStatusForSelected === 'not_started' ? 'rgba(239,68,68,.4)' : 'rgba(96,165,250,.4)'}`,
                        }} />
                        {STATUS[effectiveStatusForSelected || '']?.label || effectiveStatusForSelected || '—'}
                      </span>
                    </div>
                    <div className="k">Этап</div>
                    <div className="v">{selectedNode.stage || '—'}</div>
                    <div className="k">Роль</div>
                    <div className="v">{selectedNode.role || '—'}</div>
                  </div>
                  {(selectedStatus || mockStatusForCard) ? (
                    <>
                      <div className="divider" />
                      <div className="kv">
                        <div className="k">Дата обращения</div>
                        <div className="v">{(selectedStatus?.request_date ?? mockStatusForCard?.request_date) ?? '—'}</div>
                        <div className="k">Срок исполнения</div>
                        <div className="v">{(selectedStatus?.due_date ?? mockStatusForCard?.due_date) ?? '—'}</div>
                        <div className="k">Срок действия документа</div>
                        <div className="v">{(selectedStatus?.valid_until_date ?? mockStatusForCard?.valid_until_date) ?? '—'}</div>
                        <div className="k">Исполнитель (компания)</div>
                        <div className="v">{(selectedStatus?.executor_company ?? mockStatusForCard?.executor_company) ?? '—'}</div>
                        <div className="k">Исполнитель (госорган)</div>
                        <div className="v">{(selectedStatus?.executor_authority ?? mockStatusForCard?.executor_authority) ?? '—'}</div>
                        {(selectedStatus?.note ?? mockStatusForCard?.note) && (
                          <>
                            <div className="k">Примечание</div>
                            <div className="v">{escapeHtml((selectedStatus?.note ?? mockStatusForCard?.note) ?? '')}</div>
                          </>
                        )}
                      </div>
                      <div className="divider" />
                      <div className="groupTitle">Файлы ({loadingFiles ? '…' : cardFiles.length})</div>
                      {loadingFiles ? (
                        <p className="muted">Загрузка…</p>
                      ) : (
                        <ul className="cardFileList">
                          {cardFiles.map((f) => (
                            <li key={f.id} className="cardFileItem">
                              <a href={`${API_URL}/document-roadmap/files/${f.id}/download`} target="_blank" rel="noopener noreferrer">
                                {escapeHtml(f.file_name)}
                              </a>
                              <button type="button" className="btn ghost small" onClick={() => handleDeleteFile(f.id)} title="Удалить">
                                ✕
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="cardUpload">
                        <label className="btn ghost small">
                          {uploadingFile ? 'Загрузка…' : 'Прикрепить PDF'}
                          <input
                            type="file"
                            accept="application/pdf"
                            disabled={uploadingFile}
                            style={{ display: 'none' }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleUploadFile(file);
                              e.target.value = '';
                            }}
                          />
                        </label>
                      </div>
                    </>
                  ) : selectedSectionCode && selectedProjectId ? (
                    <p className="muted" style={{ marginTop: 8 }}>Создание статуса…</p>
                  ) : null}
                  <div className="divider" />
                  <div className="miniItem">
                    <b>Зависимости</b>
                    <p>{deps.length ? deps.map((d) => `${d.text.split('\n')[0]} (${STATUS[getEffectiveStatus(d.id, statusesBySection)]?.label || getEffectiveStatus(d.id, statusesBySection)})`).join(' • ') : 'Нет'}</p>
                  </div>
                  <div className="miniItem" style={{ marginTop: 10 }}>
                    <b>Что блокирует</b>
                    <p>{outs.length ? outs.map((o) => o.text.split('\n')[0]).join(' • ') : 'Нет'}</p>
                  </div>
                  <div className="divider" />
                  <div className="cardPopupWhy">
                    <div className="groupTitle">Подсказка по смыслу</div>
                    <div className="warnBox">{whyText}</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="kv">
                    <div className="k">Название</div>
                    <div className="v">—</div>
                    <div className="k">Статус</div>
                    <div className="v">—</div>
                  </div>
                  <div className="divider" />
                  <div className="cardPopupWhy">
                    <div className="groupTitle">Подсказка по смыслу</div>
                    <div className="warnBox">{whyText}</div>
                  </div>
                </>
              )}
            </div>
          </div>
          </>
        )}
      </div>
    </>
  );
};

export default DocumentRoadmap;

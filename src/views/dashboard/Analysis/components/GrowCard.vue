<template>
  <div class="grow-card-grid">
    <Card
      v-for="item in growCardList"
      :key="item.title"
      size="small"
      :loading="loading"
      :bordered="false"
      class="grow-card"
      :bodyStyle="{ padding: '0' }"
    >
      <div class="grow-card__content" :style="getCardTone(item)">
        <div class="grow-card__glow"></div>
        <div class="grow-card__header">
          <div class="grow-card__header-main">
            <div class="grow-card__eyebrow">实时概览</div>
            <div class="grow-card__title">{{ item.title }}</div>
          </div>
          <div class="grow-card__icon-box">
            <Icon :icon="item.icon" :size="28" :color="item.color" />
          </div>
        </div>

        <div class="grow-card__value-row">
          <CountTo prefix="" :startVal="0" :endVal="item.value || 0" separator="," class="grow-card__value" />
          <span class="grow-card__tag" :class="getTrendClass(item.total)">
            {{ item.total >= 0 ? '上涨' : '下降' }}
          </span>
        </div>

        <div class="grow-card__footer">
          <span class="grow-card__compare">较昨日</span>
          <div class="grow-card__trend" :class="getTrendClass(item.total)">
            <arrow-up-outlined v-if="item.total >= 0" />
            <arrow-down-outlined v-else />
            <span>{{ formatTrend(item.total) }}</span>
          </div>
        </div>

        <div class="grow-card__bar">
          <span class="grow-card__bar-fill"></span>
        </div>
      </div>
    </Card>
  </div>
</template>
<script lang="ts" setup>
  import { CountTo } from '/@/components/CountTo/index';
  import { Icon } from '/@/components/Icon';
  import { Card } from 'ant-design-vue';
  import { growCardList, type GrowCardItem } from '../data';
  import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons-vue';

  defineProps({
    loading: {
      type: Boolean,
    },
  });

  function formatTrend(value: number) {
    return `${Math.abs(value).toFixed(2)}%`;
  }

  function getTrendClass(value: number) {
    return value >= 0 ? 'is-up' : 'is-down';
  }

  function getCardTone(item: GrowCardItem) {
    return {
      '--card-tone': item.color || '#2563eb',
      '--card-tone-soft': item.softColor || 'rgba(37, 99, 235, 0.14)',
    };
  }
</script>

<style lang="less" scoped>
  .grow-card-grid {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 16px;
  }

  .grow-card {
    overflow: hidden;
    border-radius: 20px;
    box-shadow: 0 18px 36px rgba(15, 23, 42, 0.06);
  }

  .grow-card__content {
    position: relative;
    min-height: 214px;
    padding: 20px 22px 18px;
    background: radial-gradient(circle at top right, var(--card-tone-soft), transparent 28%), linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  }

  .grow-card__glow {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.85), transparent 55%);
    pointer-events: none;
  }

  .grow-card__header,
  .grow-card__value-row,
  .grow-card__footer,
  .grow-card__bar {
    position: relative;
    z-index: 1;
  }

  .grow-card__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
  }

  .grow-card__eyebrow {
    font-size: 13px;
    color: #94a3b8;
    letter-spacing: 0.08em;
  }

  .grow-card__title {
    margin-top: 8px;
    font-size: 18px;
    font-weight: 600;
    line-height: 1.4;
    color: #0f172a;
  }

  .grow-card__icon-box {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 54px;
    height: 54px;
    border-radius: 18px;
    background: var(--card-tone-soft);
    box-shadow:
      inset 0 0 0 1px rgba(255, 255, 255, 0.72),
      0 10px 24px rgba(15, 23, 42, 0.06);
    flex: none;
  }

  .grow-card__value-row {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 12px;
    margin-top: 34px;
  }

  .grow-card__value {
    font-size: 46px;
    line-height: 1;
    font-weight: 700;
    color: #1e293b;
    letter-spacing: -0.03em;
  }

  .grow-card__tag {
    display: inline-flex;
    align-items: center;
    height: 28px;
    padding: 0 12px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 600;
  }

  .grow-card__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-top: 28px;
  }

  .grow-card__compare {
    font-size: 14px;
    color: #64748b;
  }

  .grow-card__trend {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 18px;
    font-weight: 700;
  }

  .grow-card__bar {
    margin-top: 18px;
    width: 100%;
    height: 6px;
    border-radius: 999px;
    background: rgba(148, 163, 184, 0.16);
    overflow: hidden;
  }

  .grow-card__bar-fill {
    display: block;
    width: 68%;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, var(--card-tone) 0%, rgba(255, 255, 255, 0.92) 140%);
  }

  .is-up {
    color: #15803d;
  }

  .grow-card__tag.is-up {
    background: rgba(34, 197, 94, 0.12);
  }

  .is-down {
    color: #ef4444;
  }

  .grow-card__tag.is-down {
    background: rgba(239, 68, 68, 0.12);
  }

  @media (max-width: 1600px) {
    .grow-card-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  @media (max-width: 992px) {
    .grow-card-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 640px) {
    .grow-card-grid {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>

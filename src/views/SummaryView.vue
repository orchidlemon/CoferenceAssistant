<template>
  <div>
    <!-- Banner -->
    <div class="banner">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:14px">
        <div>
          <div style="display:flex;gap:7px;margin-bottom:8px">
            <span v-if="currentMeeting" class="badge" :class="sumStatusBadgeClass">{{ sumStatusLabel }}</span>
            <span v-if="aiGenerated" class="badge b-ai">✨ AI 纪要已生成</span>
            <span v-else-if="currentMeeting" class="badge b-ai">✨ AI 纪要待生成</span>
          </div>
          <div class="banner-title">{{ currentMeeting?.title || '暂未选择会议' }}</div>
          <div class="banner-meta">
            <div class="mi">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {{ sumMeetingTimeStr }}
            </div>
            <div class="mi">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              {{ currentMeeting?.participants?.length || 0 }} 人参与
            </div>
            <div class="mi">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
              {{ sumPlatformLabel }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state for new users -->
    <div v-if="!currentMeeting"
         class="card" style="padding:60px 40px;text-align:center;color:var(--t3);margin-top:16px">
      <div style="font-size:36px;margin-bottom:12px">📋</div>
      <div style="font-size:15px;font-weight:600;color:var(--t2);margin-bottom:6px">暂无会议纪要</div>
      <div style="font-size:13px;margin-bottom:20px">请先在「全部会议」中选择一场已结束的会议，或新建一场会议</div>
      <button class="btn btn-pri" @click="store.currentView='meetings'">前往全部会议 →</button>
    </div>

    <div v-else class="sum-grid">
      <div>

        <!-- ① 音视频上传 + AI 生成入口 -->
        <div class="card" style="margin-bottom:14px">
          <div class="ch">
            <span class="ct">会议录制</span>
            <span style="font-size:11px;color:var(--t2)">上传后 AI 自动生成纪要</span>
          </div>
          <div class="cb">
            <div v-if="!mediaFile"
                 class="upload-zone" :class="{drag: isDragging}"
                 @click="mediaInput.click()"
                 @dragover.prevent="isDragging=true"
                 @dragleave="isDragging=false"
                 @drop.prevent="handleMediaDrop">
              <div class="upload-zone-icon">🎬</div>
              <div class="upload-zone-text">点击上传或拖拽会议录制文件</div>
              <div class="upload-zone-hint">支持 MP4、MP3、WAV、M4A、WebM，最大 500MB</div>
            </div>
            <input ref="mediaInput" type="file" style="display:none"
                   accept=".mp4,.mp3,.wav,.m4a,.webm,.mov,.aac"
                   @change="handleMediaFile($event.target.files[0])">

            <div v-if="mediaFile" class="file-item" style="margin-bottom:10px">
              <div class="file-icon" :style="{background: mediaFile.isVideo ? '#FEE2E2' : '#D1FAE5'}">
                {{ mediaFile.isVideo ? '🎬' : '🎵' }}
              </div>
              <div style="flex:1">
                <div class="file-name">{{ mediaFile.name }}</div>
                <div class="file-size">{{ mediaFile.size }}</div>
              </div>
              <button class="file-del" @click="mediaFile=null; aiGenerated=false">×</button>
            </div>

            <!-- Notes input -->
            <div style="margin-top:12px">
              <div style="font-size:12px;color:var(--t2);margin-bottom:5px">
                会议记录 / 文字稿
                <span style="color:var(--t3)">（粘贴录音转文字稿或手写记录，AI 将据此生成纪要）</span>
              </div>
              <textarea v-model="meetingNotes"
                        placeholder="粘贴会议记录或录音转文字稿…&#10;&#10;若发言人用 A、B、C 或 Speaker 1、2、3 等代号标注，&#10;系统会自动识别这些代号，但需要您手动填写对应的真实姓名。&#10;可在生成前填写（AI 直接用真名），也可生成后在摘要中替换。"
                        style="width:100%;min-height:120px;font-size:13px;line-height:1.7;padding:10px 12px;border:1px solid var(--bd);border-radius:var(--r8);resize:vertical;color:var(--t1);font-family:inherit;outline:none;box-sizing:border-box;background:var(--bg2)"
                        @focus="e => e.target.style.borderColor='var(--primary)'"
                        @blur="e => e.target.style.borderColor='var(--bd)'"
                        @input="detectSpeakers"></textarea>
            </div>

            <!-- Speaker mapping (auto-shown when labels detected) -->
            <div v-if="detectedSpeakers.length"
                 style="margin-top:10px;padding:12px 14px;background:var(--bg2);border:1px solid var(--bd);border-radius:var(--r8)">
              <div style="font-size:12px;font-weight:600;color:var(--t2);margin-bottom:10px;display:flex;align-items:center;gap:6px">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 100 6 3 3 0 000-6z"/><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/></svg>
                检测到 {{ detectedSpeakers.length }} 个匿名发言人代号，请手动填写对应真实姓名（留空则保持原代号）
              </div>
              <div v-for="spk in detectedSpeakers" :key="spk"
                   style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
                <span style="font-size:12px;font-weight:700;background:#EDE9FE;color:var(--ai);padding:3px 10px;border-radius:6px;min-width:36px;text-align:center;flex-shrink:0">
                  {{ spk }}
                </span>
                <span style="font-size:12px;color:var(--t3);flex-shrink:0">→</span>
                <input type="text"
                       v-model="speakerMap[spk]"
                       :placeholder="'输入姓名，或从参与者中选择'"
                       :list="'spk-list'"
                       class="inp"
                       style="flex:1;padding:5px 9px;font-size:12px" />
              </div>
              <datalist id="spk-list">
                <option v-for="name in (currentMeeting?.participants || [])" :key="name" :value="name" />
              </datalist>
            </div>

            <div style="display:flex;align-items:center;gap:10px;margin-top:10px">
              <button class="btn btn-ai" style="flex:1;justify-content:center"
                      :disabled="isGenerating"
                      @click="generateSummary">
                <template v-if="isGenerating">
                  <div class="dots"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>
                  AI 分析中，请稍候…
                </template>
                <template v-else>
                  ✨ {{ aiGenerated ? '重新生成纪要' : 'AI 生成会议纪要' }}
                </template>
              </button>
              <span v-if="aiGenerated" class="badge b-ok">✓ 已生成</span>
            </div>

            <div v-if="isGenerating" style="margin-top:10px">
              <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--t2);margin-bottom:4px">
                <span>{{ progressLabel }}</span><span>{{ progress }}%</span>
              </div>
              <div style="height:4px;background:#E5E7EB;border-radius:2px">
                <div :style="{width:progress+'%'}" style="height:100%;background:var(--ai);border-radius:2px;transition:width .3s"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- ② AI 会议摘要（可编辑） -->
        <div class="card" style="margin-bottom:14px">
          <div class="ch">
            <span class="ct">AI 会议摘要</span>
            <div style="display:flex;gap:7px;align-items:center">
              <span v-if="aiGenerated" class="badge b-ok">✓ 已生成</span>
              <template v-if="!summaryEditMode">
                <button class="btn btn-ghost" style="font-size:11px;padding:3px 7px"
                        @click="startSummaryEdit">✏ 编辑</button>
              </template>
              <template v-else>
                <button class="btn btn-ghost" style="font-size:11px;padding:3px 7px"
                        @click="cancelSummaryEdit">取消</button>
                <button class="btn btn-pri" style="font-size:11px;padding:3px 9px"
                        @click="saveSummaryEdit">保存</button>
              </template>
            </div>
          </div>
          <div class="cb">
            <div v-if="aiGenerated"
                 style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--t3);padding:6px 0 10px;border-bottom:1px solid var(--bd);margin-bottom:10px">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              AI 根据您提供的会议记录生成，内容仅供参考，人名、决策等关键信息请人工核实后确认
            </div>

            <!-- Post-generation speaker mapping -->
            <div v-if="aiGenerated && detectedSpeakers.length"
                 style="margin-bottom:14px;padding:12px 14px;background:#F5F3FF;border:1px solid #DDD6FE;border-radius:var(--r8)">
              <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px">
                <span style="font-size:12px;font-weight:600;color:#7C3AED;display:flex;align-items:center;gap:5px">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                  发言人映射
                </span>
                <button class="btn btn-ghost"
                        style="font-size:11px;padding:3px 10px;border-color:#7C3AED;color:#7C3AED"
                        @click="applySummaryMapping">应用到摘要</button>
              </div>
              <div style="font-size:11px;color:var(--t3);margin-bottom:10px">
                填写匿名代号对应的真实姓名，点击「应用到摘要」后摘要中的代号将被替换
              </div>
              <div v-for="spk in detectedSpeakers" :key="spk"
                   style="display:flex;align-items:center;gap:8px;margin-bottom:7px">
                <span style="font-size:12px;font-weight:700;background:#EDE9FE;color:#7C3AED;padding:3px 10px;border-radius:6px;min-width:36px;text-align:center;flex-shrink:0">
                  {{ spk }}
                </span>
                <span style="font-size:12px;color:var(--t3);flex-shrink:0">→</span>
                <input type="text"
                       v-model="speakerMap[spk]"
                       placeholder="输入姓名或从参与者中选择"
                       list="spk-list-post"
                       class="inp"
                       style="flex:1;padding:5px 9px;font-size:12px" />
              </div>
              <datalist id="spk-list-post">
                <option v-for="name in (currentMeeting?.participants || [])" :key="name" :value="name" />
              </datalist>
            </div>

            <!-- View mode -->
            <div v-if="!summaryEditMode && summaryText" class="sum-text" v-html="summaryText"></div>
            <div v-else-if="!summaryEditMode"
                 style="padding:24px 0;text-align:center;font-size:13px;color:var(--t3)">
              上传会议录制后，点击「AI 生成会议纪要」即可自动生成摘要
            </div>
            <!-- Edit mode -->
            <textarea v-else
                      v-model="summaryEditText"
                      style="width:100%;min-height:180px;font-size:13px;line-height:1.8;padding:10px 12px;border:1px solid var(--bdr, var(--bd));border-radius:var(--r8);resize:vertical;color:var(--t1);font-family:inherit;outline:none;box-sizing:border-box;background:var(--bg2)"
                      @focus="e => e.target.style.borderColor='var(--primary)'"
                      @blur="e => e.target.style.borderColor='var(--bd)'"></textarea>
            <div v-if="summaryEditMode" style="font-size:11px;color:var(--t3);margin-top:6px">
              提示：编辑后保存将覆盖 AI 生成的内容
            </div>
          </div>
        </div>

        <!-- ③ 关键决策（仅 AI 生成后展示） -->
        <div v-if="aiGenerated" class="card" style="margin-bottom:14px">
          <div class="ch"><span class="ct">关键决策</span><span class="badge b-ai">✨ AI 提取</span></div>
          <div class="cb" style="padding:8px 16px">
            <div v-if="!summaryDecisions.length"
                 style="padding:16px;text-align:center;font-size:13px;color:var(--t3)">
              本次会议暂无明确决策记录
            </div>
            <div v-for="(d, i) in summaryDecisions" :key="i"
                 style="padding:10px 0;border-bottom:1px solid var(--bd)"
                 :style="i===summaryDecisions.length-1?{borderBottom:'none'}:{}">
              <div style="display:flex;gap:8px;align-items:flex-start">
                <span style="color:var(--primary);font-size:14px;flex-shrink:0;margin-top:1px">✦</span>
                <div>
                  <div style="font-size:13px;font-weight:500;color:var(--t1)">{{ d.content }}</div>
                  <div v-if="d.context" style="font-size:12px;color:var(--t3);margin-top:3px">{{ d.context }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ④ Action Items (可编辑) -->
        <div class="card">
          <div class="ch">
            <span class="ct">Action Items</span>
            <div style="display:flex;gap:7px;align-items:center">
              <span style="font-size:12px;color:var(--t2)">{{ summaryActions.length }} 项 · {{ summaryDoneCount }} 已完成</span>
              <span class="badge b-ai">✨ AI 提取</span>
              <button class="btn btn-ghost" style="font-size:11px;padding:3px 7px" @click="addAction">+ 添加</button>
            </div>
          </div>
          <div class="cb" style="padding:4px 16px">
            <div v-for="(a, i) in summaryActions" :key="a.id"
                 class="ai-item" :style="i===summaryActions.length-1?'border-bottom:none':''">
              <div class="chk" :class="{done:a.done}" @click="toggleDone(a.id)">
                <svg v-if="a.done" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div class="pdot" :class="a.priority==='h'?'ph':a.priority==='m'?'pm':'pl'" style="margin-top:14px"></div>
              <div style="flex:1;min-width:0">
                <div class="ai-txt" :class="{done:a.done}"
                     :contenteditable="!a.done"
                     spellcheck="false"
                     style="outline:none"
                     :style="!a.done ? {borderBottom:'1px dashed transparent'} : {}"
                     @focus="e => e.target.style.borderBottomColor='var(--primary)'"
                     @blur="e => { a.text = e.target.textContent.trim(); e.target.style.borderBottomColor='transparent' }">{{ a.text }}</div>

                <div class="action-fields">
                  <button class="assignee-btn" :class="{unset:!a.assignee}"
                          @click="openAssignee($event, a.id)">
                    <template v-if="a.assignee">
                      <div class="av" :style="{width:'18px',height:'18px',fontSize:'9px',background:a.acolor}">{{ a.assignee[0] }}</div>
                      <span>{{ a.assignee }}</span>
                    </template>
                    <template v-else>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      <span>指定负责人</span>
                    </template>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                  </button>

                  <button v-if="showDueFor !== a.id" class="due-btn" :class="{unset:!a.dueDate}"
                          @click="showDueFor = a.id">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    <span :style="{color: a.dueClass==='tg-r'?'var(--err)':a.dueClass==='tg-y'?'var(--warn)':'var(--t2)'}">
                      {{ a.dueLabel || '设置截止日期' }}
                    </span>
                  </button>
                  <input v-else type="date" class="due-input"
                         :value="a.dueDate"
                         @change="onSetDue(a, $event.target.value)"
                         @blur="showDueFor = null">

                  <span v-if="a.tracked" class="tag tg-g" style="font-size:10px;cursor:pointer;user-select:none"
                        @click="toggleTracked(a.id)" title="点击取消追踪">✓ 已追踪</span>
                  <button v-else class="btn btn-ghost" style="font-size:10px;padding:2px 8px;color:var(--primary);border-color:var(--primary)"
                          @click="toggleTracked(a.id)">+ 加入追踪</button>
                  <button class="btn btn-ghost" style="font-size:10px;padding:2px 8px;color:var(--err);border-color:var(--err);margin-left:auto"
                          @click="deleteAction(a.id)" title="删除此 Action">删除</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右栏 -->
      <div>
        <!-- 分发纪要 -->
        <div class="card" style="margin-bottom:14px">
          <div class="ch"><span class="ct">分发纪要</span></div>
          <div class="cb" style="padding:12px 16px">
            <button class="share-btn" @click="exportMarkdown">
              <div class="share-ico" style="background:#F5F3FF">⬇️</div>导出 Markdown
            </button>
            <button class="share-btn" @click="exportWord">
              <div class="share-ico" style="background:#EFF6FF">📄</div>导出 Word
            </button>
          </div>
        </div>

        <!-- 会议文件 -->
        <div class="card" style="margin-bottom:14px">
          <div class="ch">
            <span class="ct">会议文件</span>
            <span style="font-size:11px;color:var(--t2)">{{ store.files.length }} 份</span>
          </div>
          <div class="cb" style="padding:8px 14px">
            <div v-if="!store.files.length"
                 style="text-align:center;padding:14px;font-size:12px;color:var(--t3)">
              暂无会议文件
            </div>
            <div v-for="f in store.files" :key="f.id"
                 style="display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid var(--bd)"
                 :style="store.files.indexOf(f)===store.files.length-1?{borderBottom:'none'}:{}">
              <div class="file-icon" :style="{background:f.bg,flexShrink:0}">{{ f.icon }}</div>
              <div style="flex:1;min-width:0">
                <div style="font-size:12px;font-weight:500;color:var(--t1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ f.name }}</div>
                <div style="font-size:11px;color:var(--t3)">{{ f.size }}</div>
              </div>
              <button class="btn btn-ghost" style="font-size:11px;padding:3px 9px;flex-shrink:0"
                      @click="downloadFile(f)">⬇ 下载</button>
            </div>
          </div>
        </div>

        <!-- 参会者 -->
        <div class="card" style="margin-bottom:14px">
          <div class="ch">
            <span class="ct">参会者</span>
            <span style="font-size:11px;color:var(--t2)">{{ meetingAttendees.length }} 人</span>
          </div>
          <div class="cb" style="padding:10px 14px">
            <div v-for="c in meetingAttendees" :key="c.name"
                 style="display:flex;align-items:center;gap:9px;padding:5px 0;border-bottom:1px solid var(--bd)"
                 :style="meetingAttendees.indexOf(c)===meetingAttendees.length-1?{borderBottom:'none'}:{}">
              <div class="av" :style="{width:'28px',height:'28px',fontSize:'11px',flexShrink:0,background:c.color}">{{ c.name[0] }}</div>
              <div style="flex:1">
                <div style="font-size:13px;font-weight:600;color:var(--t1)">{{ c.name }}</div>
                <div style="font-size:11px;color:var(--t2)">{{ c.role }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="ai-disc">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          AI 内容仅供参考，关键决策请以参会者确认版本为准。
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { store, toast, toggleActionDone, toggleActionTracked, addNewAction, setActionDue, dueInfo, nextActionId, persistUserData, deleteAction } from '../store.js'
import { callAI, PROMPTS, parseJSON } from '../ai.js'

// ── Current meeting ───────────────────────────────────
const currentMeeting = computed(() =>
  store.meetings.find(m => m.id === store.currentMeetingId) || null
)

function getStatus(m) {
  if (!m?.scheduledAt) return 'upcoming'
  const now   = Date.now()
  const start = new Date(m.scheduledAt).getTime()
  const end   = start + (m.duration || 60) * 60000
  if (now >= start && now < end) return 'active'
  if (now < start)               return 'upcoming'
  return 'ended'
}

const sumStatus          = computed(() => getStatus(currentMeeting.value))
const sumStatusLabel     = computed(() => sumStatus.value === 'active' ? '进行中' : sumStatus.value === 'upcoming' ? '即将开始' : '已结束')
const sumStatusBadgeClass = computed(() => sumStatus.value === 'active' ? 'b-ok' : sumStatus.value === 'upcoming' ? 'b-warn' : '')

const SUM_PLATFORM_MAP = { zoom: 'Zoom', tencent: '腾讯会议', feishu: '飞书会议', other: '其他' }
const sumPlatformLabel = computed(() => {
  const p = currentMeeting.value?.platform
  return SUM_PLATFORM_MAP[p] || p || 'Zoom'
})

const sumMeetingTimeStr = computed(() => {
  const m = currentMeeting.value
  if (!m?.scheduledAt) return '今日 09:30 – 10:30（60 分钟）'
  const startMs  = new Date(m.scheduledAt).getTime()
  const endMs    = startMs + (m.duration || 60) * 60000
  const start    = m.scheduledAt.split('T')[1]?.slice(0, 5) || ''
  const end      = new Date(endMs).toTimeString().slice(0, 5)
  const dateStr  = m.scheduledAt.split('T')[0]
  const today    = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
  const label    = dateStr === today ? '今日' : dateStr === tomorrow ? '明日' : dateStr.slice(5).replace('-', '/')
  return `${label} ${start} – ${end}（${m.duration} 分钟）`
})

// ── Actions ─────────────────────────────────────────
const summaryActions   = computed(() => store.actions.filter(a => store.summaryActionIds.includes(a.id)))
const summaryDoneCount = computed(() => summaryActions.value.filter(a => a.done).length)

function toggleDone(id) { toggleActionDone(id) }

function toggleTracked(id) {
  const a = store.actions.find(x => x.id === id)
  toggleActionTracked(id)
  toast(a && !a.tracked ? '📌 已加入 Action 追踪器' : '已取消追踪')
}

function addAction() {
  addNewAction('新 Action', true)
  toast('✅ 新 Action 已同步到追踪器')
}

function openAssignee(event, actionId) {
  const rect = event.currentTarget.getBoundingClientRect()
  store.assigneePop.actionId = actionId
  store.assigneePop.x = rect.left
  store.assigneePop.y = rect.bottom + 6
  store.assigneePop.show = true
}

const showDueFor = ref(null)

function onSetDue(action, val) {
  showDueFor.value = null
  if (!val) return
  setActionDue(action.id, val)
  toast('📅 截止日期已设为 ' + val)
}

// ── AI Summary edit mode ─────────────────────────────
const summaryEditMode = ref(false)
const summaryEditText = ref('')
const customSummary   = ref('')

function startSummaryEdit() {
  summaryEditText.value = summaryText.value
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<strong>(.*?)<\/strong>/gi, '$1')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '$1')
    .replace(/<[^>]+>/g, '')
    .trim()
  summaryEditMode.value = true
}

function saveSummaryEdit() {
  customSummary.value   = summaryEditText.value
  summaryEditMode.value = false
  toast('📝 摘要已保存')
}

function cancelSummaryEdit() {
  summaryEditMode.value = false
  summaryEditText.value = ''
}

// ── Media upload & AI generation ─────────────────────
const mediaInput       = ref(null)
const mediaFile        = ref(null)
const isDragging       = ref(false)
const isGenerating     = ref(false)
const aiGenerated      = ref(false)
const progress         = ref(0)
const progressLabel    = ref('正在处理…')
const meetingNotes     = ref('')
const summaryDecisions = ref([])
const detectedSpeakers = ref([])
const speakerMap       = ref({})

// Detect speaker labels like "A:", "B:", "Speaker 1:", "甲:" from pasted transcript
function detectSpeakers() {
  const text = meetingNotes.value
  if (!text.trim()) { detectedSpeakers.value = []; speakerMap.value = {}; return }

  const found = new Set()
  const patterns = [
    /^([A-Z])[:：]/gm,                       // A:  B:  C:
    /^(Speaker\s*[A-Z0-9]+)[:：]/gim,        // Speaker A:  Speaker 1:
    /^(发言人\s*[A-Z0-9]+)[:：]/gm,          // 发言人A:  发言人1:
    /^([甲乙丙丁戊己庚辛])[:：]/gm,           // 甲:  乙:
  ]
  for (const pat of patterns) {
    let m
    const re = new RegExp(pat.source, pat.flags)
    while ((m = re.exec(text)) !== null) found.add(m[1].trim())
  }

  detectedSpeakers.value = [...found]
  // Add new keys; keep existing values; prune removed keys
  for (const s of found) { if (!(s in speakerMap.value)) speakerMap.value[s] = '' }
  for (const k of Object.keys(speakerMap.value)) { if (!found.has(k)) delete speakerMap.value[k] }
}

// Replace "A:" → "李明：" etc. in the transcript before sending to AI
function applyMappings(text) {
  let result = text
  for (const [label, name] of Object.entries(speakerMap.value)) {
    if (!name?.trim()) continue
    const esc = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    result = result.replace(new RegExp(`^${esc}[:：]`, 'gm'), `${name.trim()}：`)
  }
  return result
}

const MEDIA_EXTS = new Set(['mp4','mp3','wav','m4a','webm','mov','aac'])

function formatSize(bytes) {
  if (bytes < 1024*1024) return (bytes/1024).toFixed(0) + ' KB'
  return (bytes/1024/1024).toFixed(1) + ' MB'
}

function handleMediaFile(file) {
  if (!file) return
  const ext = file.name.split('.').pop().toLowerCase()
  if (!MEDIA_EXTS.has(ext)) { toast('不支持该文件格式'); return }
  mediaFile.value = { name: file.name, size: formatSize(file.size), isVideo: ['mp4','webm','mov'].includes(ext) }
  aiGenerated.value = false
  toast('📎 文件已选择：' + file.name)
}

function handleMediaDrop(e) {
  isDragging.value = false
  handleMediaFile(e.dataTransfer.files[0])
}

async function generateSummary() {
  if (!store.aiSettings.apiKey?.trim()) {
    toast('请先在「AI 设置」中配置 API Key')
    store.currentView = 'settings'
    return
  }
  if (isGenerating.value) return
  isGenerating.value  = true
  progress.value      = 0
  aiGenerated.value   = false
  customSummary.value = ''

  const iv = setInterval(() => { if (progress.value < 85) progress.value += 2 }, 200)
  progressLabel.value = '✨ AI 分析中…'

  try {
    const rawNotes  = meetingNotes.value.trim() || '（未提供详细记录，请根据会议基本信息生成框架性纪要）'
    const notes     = applyMappings(rawNotes)
    const { system, user } = PROMPTS.summary(currentMeeting.value, notes, store.aiSettings.customPrompts?.summary)
    const raw    = await callAI(system, user, store.aiSettings)
    const parsed = parseJSON(raw)

    if (parsed.summary) customSummary.value = parsed.summary
    if (Array.isArray(parsed.decisions)) summaryDecisions.value = parsed.decisions

    if (Array.isArray(parsed.actions) && parsed.actions.length) {
      // Remove old AI-generated summary actions
      store.summaryActionIds.forEach(id => {
        const idx = store.actions.findIndex(a => a.id === id)
        if (idx !== -1) store.actions.splice(idx, 1)
      })
      store.summaryActionIds.splice(0)

      // Add new AI actions
      parsed.actions.forEach(a => {
        const id      = nextActionId()
        const contact = store.contacts.find(c => c.name === a.assignee)
        store.actions.push({
          id,
          text:          a.text || '新 Action',
          assignee:      a.assignee || '',
          acolor:        contact?.color || (a.assignee === store.currentUser?.name ? store.currentUser?.color : '#6B7280'),
          dueDate: '', dueLabel: '', dueClass: 'tg-n',
          done:          false,
          source:        currentMeeting.value?.title || 'AI 生成',
          priority:      a.priority || 'l',
          tracked:       a.assignee === store.currentUser?.name,
          followed:      false,
          addedToAgenda: false,
        })
        store.summaryActionIds.push(id)
      })
    }

    persistUserData()
    clearInterval(iv)
    progress.value      = 100
    progressLabel.value = '✅ 生成完成'
    aiGenerated.value   = true
    toast('✨ AI 纪要已生成，请核实后确认')
  } catch (e) {
    clearInterval(iv)
    toast('❌ AI 生成失败：' + e.message)
  } finally {
    isGenerating.value = false
  }
}

// ── Summary text ──────────────────────────────────────
const summaryText = computed(() =>
  customSummary.value ? customSummary.value.replace(/\n/g, '<br>') : ''
)

// Apply speaker label → real name replacements to the generated summary text
function applySummaryMapping() {
  if (!customSummary.value) {
    toast('请先生成会议纪要')
    return
  }
  const mappings = Object.entries(speakerMap.value).filter(([, name]) => name?.trim())
  if (!mappings.length) {
    toast('请先填写发言人对应的真实姓名')
    return
  }
  let text = customSummary.value
  for (const [label, name] of mappings) {
    const esc = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    // Single letter: only replace when not adjacent to other letters (avoids "API" → "APIdeal" etc.)
    const pattern = /^[A-Za-z]$/.test(label)
      ? new RegExp('(?<![A-Za-z])' + esc + '(?![A-Za-z])', 'g')
      : new RegExp(esc, 'g')
    text = text.replace(pattern, name.trim())
  }
  customSummary.value = text
  toast('✅ 发言人标签已替换为真实姓名')
}

// ── Export ────────────────────────────────────────────
function downloadBlob(content, filename, mime) {
  const blob = new Blob([content], { type: mime })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
  toast(`✅ ${filename} 已导出`)
}

function exportMarkdown() {
  const m       = currentMeeting.value
  const title   = m?.title || 'Q2 产品路线图评审'
  const timeStr = sumMeetingTimeStr.value
  const people  = meetingAttendees.value.map(a => a.name).join('、')
  const text = summaryText.value
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<[^>]+>/g, '')
  const actions = summaryActions.value
    .map(a => `- [${a.done?'x':' '}] ${a.text}${a.assignee?' (@'+a.assignee+')':''}${a.dueDate?' 截止:'+a.dueDate:''}`)
    .join('\n')
  const md = `# ${title} — 会议纪要\n\n**时间：** ${timeStr}\n**参与者：** ${people}\n\n## 会议摘要\n\n${text}\n\n## Action Items\n\n${actions}\n`
  downloadBlob(md, `${title}纪要.md`, 'text/markdown')
}

function exportWord() {
  const m       = currentMeeting.value
  const title   = m?.title || 'Q2 产品路线图评审'
  const timeStr = sumMeetingTimeStr.value
  const people  = meetingAttendees.value.map(a => a.name).join('、')
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:SimSun,serif;font-size:14pt;margin:2cm}h1{font-size:18pt}h2{font-size:14pt;margin-top:20px}</style></head><body>
<h1>${title} — 会议纪要</h1>
<p><strong>时间：</strong>${timeStr}　<strong>参与者：</strong>${people}</p>
<h2>会议摘要</h2><p>${summaryText.value.replace(/<br\s*\/?>/gi,'</p><p>')}</p>
<h2>Action Items</h2><ul>${summaryActions.value.map(a=>`<li>${a.text}${a.assignee?' — '+a.assignee:''}${a.dueDate?' （截止 '+a.dueDate+'）':''}</li>`).join('')}</ul>
</body></html>`
  downloadBlob(html, `${title}纪要.doc`, 'application/msword')
}

// ── File download ─────────────────────────────────────
function downloadFile(f) {
  const a = document.createElement('a')
  if (f.blobUrl) {
    a.href = f.blobUrl
  } else {
    // Demo file: create a placeholder blob so download still works
    const blob = new Blob([`[演示文件] ${f.name}\n文件大小：${f.size}`], { type: 'text/plain' })
    a.href = URL.createObjectURL(blob)
    setTimeout(() => URL.revokeObjectURL(a.href), 10000)
  }
  a.download = f.name
  a.click()
  toast(`⬇ 正在下载 ${f.name}`)
}

// ── Meeting attendees — driven by current meeting ─────
const meetingAttendees = computed(() => {
  const names = currentMeeting.value?.participants || []
  return names.map(name => {
    const c = store.contacts.find(x => x.name === name)
    return c ? { name, role: c.role, color: c.color } : { name, role: '', color: '#6B7280' }
  })
})
</script>

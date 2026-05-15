<template>
  <div style="max-width:560px;margin:0 auto;padding:8px 0">

    <!-- Star section — most prominent -->
    <div class="card" style="margin-bottom:16px;text-align:center;padding:32px 28px;background:linear-gradient(135deg,#FFF7ED 0%,#FFFBEB 100%);border:1.5px solid #FCD34D">
      <div style="font-size:48px;margin-bottom:10px">⭐</div>
      <div style="font-size:20px;font-weight:700;color:#92400E;margin-bottom:8px">给个 Star 鼓励一下吧！</div>
      <div style="font-size:13px;color:#B45309;margin-bottom:20px;line-height:1.7">
        开源不易，Star 是对作者最大的支持和认可<br>
        你的一个 Star，是我继续维护的最大动力 🙏
      </div>
      <a href="https://github.com/orchidlemon/CoferenceAssistant"
         target="_blank" rel="noopener"
         style="display:inline-flex;align-items:center;gap:8px;padding:11px 28px;background:#1F2937;color:white;border-radius:8px;font-size:14px;font-weight:600;text-decoration:none;transition:opacity .15s"
         @mouseenter="e => e.target.style.opacity='.85'"
         @mouseleave="e => e.target.style.opacity='1'">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.216.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
        ⭐ Star on GitHub
      </a>
      <div style="font-size:11px;color:#B45309;margin-top:12px;opacity:.8">
        github.com/orchidlemon/CoferenceAssistant
      </div>
    </div>

    <!-- Donate section -->
    <div class="card" style="padding:24px 28px">
      <div style="text-align:center;margin-bottom:20px">
        <div style="font-size:22px;margin-bottom:6px">☕</div>
        <div style="font-size:15px;font-weight:600;color:var(--t1)">请作者喝杯咖啡</div>
        <div style="font-size:12px;color:var(--t3);margin-top:4px">如果觉得有帮助，欢迎小额赞赏给个鼓励</div>
      </div>

      <div style="display:flex;gap:20px;justify-content:center">
        <!-- WeChat -->
        <div style="text-align:center;flex:1;max-width:200px">
          <div style="display:flex;align-items:center;justify-content:center;gap:5px;margin-bottom:8px">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#07C160"><path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.295.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c-.032-.276-.048-.556-.048-.837 0-3.71 3.353-6.715 7.496-6.715.235 0 .468.011.699.031C15.908 4.595 12.567 2.188 8.691 2.188zm-2.48 3.312a.9.9 0 110 1.8.9.9 0 010-1.8zm4.961 0a.9.9 0 110 1.8.9.9 0 010-1.8zM16.5 9.375c-3.728 0-6.75 2.56-6.75 5.715 0 3.154 3.022 5.715 6.75 5.715.779 0 1.524-.108 2.218-.307a.689.689 0 01.574.078l1.522.892a.262.262 0 00.134.044.236.236 0 00.236-.236c0-.058-.023-.114-.038-.17l-.312-1.184a.471.471 0 01.17-.532C22.366 18.162 23.25 16.718 23.25 15.09c0-3.155-3.022-5.715-6.75-5.715zm-2.16 3.24a.72.72 0 110 1.44.72.72 0 010-1.44zm4.32 0a.72.72 0 110 1.44.72.72 0 010-1.44z"/></svg>
            <span style="font-size:13px;font-weight:600;color:#07C160">微信支付</span>
          </div>
          <div style="border:1px solid var(--bd);border-radius:8px;padding:6px;background:white">
            <img :src="qrWechat" alt="微信收款码"
                 style="width:100%;display:block;border-radius:4px" />
          </div>
        </div>

        <!-- Alipay -->
        <div style="text-align:center;flex:1;max-width:200px">
          <div style="display:flex;align-items:center;justify-content:center;gap:5px;margin-bottom:8px">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#1677FF"><path d="M21.422 15.358c-3.83-1.153-6.055-1.84-6.055-1.84.664-1.13 1.21-2.373 1.555-3.726H21V8.217h-4.461V6.391h-2.078v1.826H9.995V6.391H7.917v1.826H3.78v1.575h4.137c-.073.49-.166.97-.28 1.433-.664 2.72-2.208 5.054-4.57 6.504.41.42.955.875 1.483 1.12 1.54-.98 2.793-2.24 3.733-3.72 1.72.98 5.74 3.07 7.63 4.3.6.388 1.28.513 2.133.29.853-.224 1.483-.807 1.88-1.56.396-.752.397-1.596-.504-1.8zM9.47 11.025c.12-.455.215-.932.287-1.433h4.534a12.06 12.06 0 01-1.301 3.328c-1.178-.495-2.386-.974-3.52-1.895z"/></svg>
            <span style="font-size:13px;font-weight:600;color:#1677FF">支付宝</span>
          </div>
          <div style="border:1px solid var(--bd);border-radius:8px;padding:6px;background:white">
            <img :src="qrAlipay" alt="支付宝收款码"
                 style="width:100%;display:block;border-radius:4px" />
          </div>
        </div>
      </div>

      <div style="text-align:center;margin-top:16px;font-size:11px;color:var(--t3)">
        感谢你的支持，每一份赞赏都让我更有动力 ❤️
      </div>
    </div>

  </div>
</template>

<script setup>
import qrWechat from '../assets/qr-wechat.jpg'
import qrAlipay from '../assets/qr-alipay.jpg'
</script>

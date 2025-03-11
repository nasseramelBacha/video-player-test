import { Component, AfterViewInit, ElementRef, ViewChild, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import videojs from 'video.js';
import 'videojs-contrib-ads';
import 'videojs-ima';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit, OnDestroy {
  @ViewChild('videoPlayer', { static: true }) videoElement!: ElementRef;
  player!: ReturnType<typeof videojs>;

  videoUrl: string = 'https://vod-prod.hometeamlive.com/ivs/v1/794141511366/2rrVbNcAU89T/1DA8E6CA-90B0-434B-A22F-02C8CAAABE9B.m3u8';
  adTagUrl: string = 'https://pubads.g.doubleclick.net/gampad/ads?iu=/23199477693/video_test&description_url=http%3A%2F%2Fapp.hometeamlive.com&tfcd=0&npa=0&sz=1x1%7C400x300%7C640x480&min_ad_duration=5000&max_ad_duration=30000&gdfp_req=1&unviewed_position_start=1&output=vast&env=vp&impl=s&correlator=&nofb=1';

  constructor(@Inject(PLATFORM_ID) private platformId: any) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.player = videojs(this.videoElement.nativeElement, {
        controls: true,
        autoplay: false,
        preload: 'auto',
        responsive: true,
        fluid: false,
        width: 800,
        height: 450,
        techOrder: ['html5'],
        html5: {
          hls: {
            overrideNative: true
          }
        },
        plugins: {
          contribAds: {},
          ima: {
            adTagUrl: this.adTagUrl,
            debug: true,
            timeout: 5000,
            prerollTimeout: 5000,
            autoPlayAdBreaks: true
          }
        }
      });

      this.player.src({
        src: this.videoUrl,
        type: 'application/x-mpegURL'
      });

      /** ✅ Asegurar que el video SIEMPRE se reproduzca si no hay anuncios */

      // 🔹 Si no hay anuncios, iniciar el video directamente
      this.player.on('ads-ad-skipped', () => {
        console.log("❌ No hay anuncios disponibles, iniciando video...");
        this.startVideo();
      });

      // 🔹 Si los anuncios terminan, iniciar el video
      this.player.on('ads-ad-ended', () => {
        console.log("✅ Anuncio finalizado, reproduciendo video...");
        this.startVideo();
      });

      // 🔹 Si hay un error en los anuncios, iniciar el video
      this.player.on('ads-ad-error', () => {
        console.log("⚠️ Error en los anuncios, iniciando video...");
        this.startVideo();
      });

      // 🔹 Si todos los anuncios se completaron, iniciar el video
      this.player.on('ads-all-ads-completed', () => {
        console.log("✅ Todos los anuncios completados, reproduciendo video...");
        this.startVideo();
      });

      // 🔹 Si la respuesta de anuncios es NULL, iniciar el video inmediatamente
      this.player.on('ads-request', () => {
        setTimeout(() => {
          if (!this.player) {
            console.log("🚫 No se encontraron anuncios, iniciando video principal...");
            this.startVideo();
          }
        }, 3000); // Esperamos 3 segundos para ver si llegan anuncios
      });

      // 🔹 Forzar la reproducción después de 5 segundos si el video sigue en negro
      setTimeout(() => {
        if (!this.player || !this.player.paused || !this.player.paused()) return;
        console.log("⏳ Forzando reproducción después de 5 segundos...");
        this.startVideo();
      }, 5000);

      this.player.ready(() => {
        console.log("✅ Video.js con anuncios VAST está listo");
      });
    }
  }

  /** 🔹 Método para asegurar que el video SIEMPRE se inicie */
  private startVideo() {
    if (!this.player) {
      console.warn("🚫 El reproductor no está inicializado aún.");
      return;
    }

    this.player.src({
      src: this.videoUrl,
      type: 'application/x-mpegURL'
    });

    this.player?.play()?.catch((e) => console.warn("🚫 Error al iniciar el video:", e));
  }

  ngOnDestroy(): void {
    if (this.player) {
      this.player.dispose();
    }
  }
}

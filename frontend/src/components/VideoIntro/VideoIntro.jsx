import React, { useEffect, useRef, useState } from "react";
import "./VideoIntro.css";

const VideoIntro = ({ onFinish }) => {
  const videoRef = useRef(null);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    video.playbackRate = 1.5;
    video.play();

    const timer = setTimeout(() => {
      video.pause();
      video.currentTime = 0;
      setFadeOut(true);

      setTimeout(() => {
        onFinish(); // tell App.js to show the main content
      }, 1000); // wait for fade-out
    }, 3000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className={`video-overlay ${fadeOut ? "fade-out" : ""}`}>
  <video ref={videoRef} id="intro-video" autoPlay muted>
    <source src="assets/videos/loading.mp4" type="video/mp4" />
    Your browser does not support the video tag.
  </video>
  <img
    src="assets/images/logo.png"
    alt="Overlay Logo"
    className="overlay-image"
  />
</div>
  );
};

export default VideoIntro;

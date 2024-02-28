const ytdl = require("ytdl-core");
const fs = require("fs");
const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
async function main() {
  rl.question("Ingresa la URL del video de youtube: ", async (url) => {
    try {
      const info = await ytdl.getInfo(url);

      const formatosConAudioYVideo = info.formats.filter(
        (formato) => formato.hasVideo && formato.hasAudio
      );

      console.log("Opciones de calidad disponibles con audio:");
      formatosConAudioYVideo.forEach((formato, index) => {
        console.log(`${index + 1}. ${formato.qualityLabel} - Con audio`);
      });

      const formatosSinAudio = info.formats.filter(
        (formato) => formato.hasVideo && !formato.hasAudio
      );

      console.log("Opciones de calidad disponibles sin audio:");
      formatosSinAudio.forEach((formato, index) => {
        console.log(
          `${index + 1 + formatosConAudioYVideo.length}. ${
            formato.qualityLabel
          } - Sin audio`
        );
      });
      rl.question("Seleccione una calidad (número): ", (opcion) => {
        const seleccion = parseInt(opcion, 10);
        if (
          isNaN(seleccion) ||
          seleccion < 1 ||
          seleccion > formatosConAudioYVideo.length
        ) {
          console.log("Opción no válida.");
          rl.close();
        } else {
          const formatoSeleccionado = formatosConAudioYVideo[seleccion - 1];
          const nombreVideo = info.videoDetails.title.replace(/[^\w\s]/gi, "");
          const nombreArchivo = `${nombreVideo}_${formatoSeleccionado.qualityLabel}.mp4`;
          console.log(`Iniciando descarga: ${nombreArchivo}`);
          const videoStream = ytdl(url, { format: formatoSeleccionado });
          const writableStream = fs.createWriteStream(nombreArchivo);
          videoStream.pipe(writableStream);
          videoStream.on("end", () => {
            console.log("descarga completa");
            rl.close();
          });
          videoStream.on("error", (error) => {
            console.error("Error al descargar el video:", error);
            rl.close();
          });
        }
      });
    } catch (error) {
      console.error(error);
    }
  });
}
main();

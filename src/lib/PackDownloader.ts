export async function downloadPack(url: string) {
  try {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    const text = await response.text();
    console.log(text);
    //   const zip = new JSZip();
    //   zip
    //     .loadAsync(buffer)
    //     .then((zip) => {
    //       zip.forEach((relativePath, file) => {
    //         file.async('nodebuffer').then((buffer) => {
    //           const filePath = path.join('mods', relativePath);
    //           fs.ensureDirSync(path.dirname(filePath));
    //           fs.writeFileSync(filePath, buffer);
    //         });
    //       });
    //     })
    //     .catch((error) => {
    //       console.error('Error loading zip:', error);
    //     });
  } catch (error) {
    console.error('Error fetching zip:', error);
  }
}

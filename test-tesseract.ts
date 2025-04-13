import Tesseract from 'tesseract.js';

async function test() {
  const worker = await Tesseract.createWorker('eng');
  console.log(worker);
}
test()
  .then(() => {
    console.log('Tesseract worker created successfully');
  })
  .catch((error) => {
    console.error('Error creating Tesseract worker:', error);
  });
// This code is a simple test to check if Tesseract.js can be initialized correctly.
//     const pdfjsLib = require('pdfjs-dist/legacy/build/pdf');
//     const loadingTask = pdfjsLib.getDocument({ data });
//     return loadingTask.promise;
//   } catch (err) {
//     console.error('Error in getDocumentProxy:', err);
//     throw err;        
//   }
// }
//
// // Export the getDocumentProxy function for use in other modules
// export { getDocumentProxy }
//
// // Export the pdfjsLib for use in other modules
// export { pdfjsLib }
//
// // Export the isBrowser variable for use in other modules
// export { isBrowser }
//
// // Export the pdfjsLib for use in other modules  
// export { pdfjsLib }
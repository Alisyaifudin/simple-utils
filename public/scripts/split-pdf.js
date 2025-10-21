var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// client/split-pdf/index.ts
import { elem$ } from "./share/elem$.js";
import { getElement as getElement2 } from "./share/element.js";
import { state$ } from "./share/state$.js";

// client/split-pdf/pdf.ts
import { PDFDocument } from "./share/pdfjs.js";
import { err, ok } from "./share/utils.js";
var PDF = class {
  constructor(file2) {
    this.file = file2;
    this._document = null;
    this.document();
  }
  document() {
    return __async(this, null, function* () {
      if (this._document) return this._document;
      const arrayBuffer = yield this.file.arrayBuffer();
      const doc = yield PDFDocument.load(arrayBuffer);
      this._document = doc;
      return doc;
    });
  }
  count() {
    return __async(this, null, function* () {
      const doc = yield this.document();
      return doc.getPageCount();
    });
  }
  split(pages) {
    return __async(this, null, function* () {
      const [from, to] = pages;
      const original = yield this.document();
      const total = original.getPageCount();
      if (from < 1 || from > total || from >= to) {
        return err(`Invalid page range: ${from}-${to}. PDF has ${total} pages.`);
      }
      const newDoc = yield PDFDocument.create();
      const pageIndices = Array.from({ length: to - from }).map((_, i) => from - 1 + i);
      const copiedPages = yield newDoc.copyPages(original, pageIndices);
      copiedPages.forEach((page) => newDoc.addPage(page));
      const pdfBytes = yield newDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      return ok(blob);
    });
  }
};

// client/split-pdf/read-pages.ts
function handlePDFUpload(pdfInput2, pdf) {
  return function() {
    return __async(this, null, function* () {
      const files = pdfInput2.files;
      if (files === null || files.length === 0) {
        pdf.set = null;
        return;
      }
      const file2 = files[0];
      const p = new PDF(file2);
      pdf.set = p;
    });
  };
}
function attachPageNumber(pageNumber2, pdf) {
  pdf.addEffect((pdf2) => __async(null, null, function* () {
    if (pdf2 === null) return;
    const file2 = pdf2.file;
    if (file2.type !== "application/pdf") {
      pageNumber2.set((old) => {
        old.textContent = "Please select a valid PDF file.";
        old.className = "text-red-500";
        return old;
      });
      return;
    }
    try {
      pageNumber2.set((old) => {
        old.textContent = "Reading PDF...";
        old.className = "";
        return old;
      });
      const numPages = yield pdf2.count();
      pageNumber2.set((old) => {
        old.textContent = `PDF has ${numPages} page${numPages !== 1 ? "s" : ""}`;
        old.className = "";
        return old;
      });
    } catch (error) {
      console.error("PDF processing error:", error);
      pageNumber2.set((old) => {
        old.textContent = "Error reading PDF. File may be corrupted or encrypted.";
        old.className = "text-red-500";
        return old;
      });
    }
  }));
}

// client/split-pdf/submit.ts
import { getElement } from "./share/element.js";

// client/split-pdf/parse-pages.ts
import { err as err2, ok as ok2 } from "./share/utils.js";
function parsePages(value, total) {
  const pages = [];
  const chunks = value.split(",");
  for (const chunk of chunks) {
    const num = Number(chunk);
    if (!isNaN(num)) {
      if (!Number.isInteger(num)) return err2("Must be integer");
      if (num < 1) return err2("Must be greater than 0");
      if (num > total) return err2("Cannot greater than the total page");
      pages.push([num, num + 1]);
      continue;
    }
    const ranges = chunk.split("-");
    if (ranges.length !== 2) {
      return err2("Invalid input");
    }
    const [n1, n2] = ranges.map(Number);
    if (isNaN(n1) || isNaN(n2)) {
      return err2("Not a number");
    }
    if (n2 <= n1) {
      return err2("Second number must be greater");
    }
    if (n1 > total) return err2("Cannot greater than the total page");
    if (!Number.isInteger(n1) || !Number.isInteger(n2)) return err2("Must be integer");
    const upper = n2 > total ? total + 1 : n2;
    pages.push([n1, upper]);
  }
  return ok2(pages);
}

// client/split-pdf/submit.ts
function handleSubmit(form2, pdf) {
  const p = getElement("#pdf-status");
  return function(e) {
    return __async(this, null, function* () {
      e.preventDefault();
      if (pdf.get === null) return;
      const formdata = new FormData(form2);
      const pagesStr = formdata.get("pages");
      const total = yield pdf.get.count();
      if (!isString(pagesStr)) return;
      const [errMsg, pages] = parsePages(pagesStr, total);
      if (errMsg !== null) {
        p.textContent = errMsg;
        console.log("hellooo");
        return;
      }
      p.textContent = "";
      const ul = getElement("#results");
      ul.innerHTML = "";
      const filenames = pdf.get.file.name.split(".");
      const filename = filenames.slice(0, filenames.length - 1);
      for (const [from, to] of pages) {
        const [li, a] = createLi(ul);
        li.textContent = "Loading...";
        pdf.get.split([from, to]).then(([errMsg2, blob]) => {
          if (errMsg2 !== null) {
            li.textContent = errMsg2;
            return;
          }
          const url = URL.createObjectURL(blob);
          a.href = url;
          const name = to === from + 1 ? `${filename}-${from}.pdf` : `${filename}-${from}-${to - 1}.pdf`;
          a.download = a.textContent = name;
          li.innerHTML = "";
          li.appendChild(a);
        });
      }
    });
  };
}
function isString(v) {
  return typeof v === "string";
}
function createLi(ul) {
  const li = document.createElement("li");
  const a = document.createElement("a");
  ul.appendChild(li);
  return [li, a];
}

// client/split-pdf/index.ts
var pdfInput = getElement2("#pdf-input");
var file = state$(null);
var pageNumber = elem$(getElement2("#pdf-page"));
var form = getElement2("form");
pdfInput.addEventListener("change", handlePDFUpload(pdfInput, file));
attachPageNumber(pageNumber, file);
form.addEventListener("submit", handleSubmit(form, file));
//# sourceMappingURL=split-pdf.js.map

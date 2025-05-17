import { useRef } from 'react';

export function usePrint() {
  // Create a reference to the element we want to print
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!printRef.current) return;

    // Store the original styles to restore after print
    const originalStyles = {
      overflow: document.body.style.overflow,
      backgroundColor: document.body.style.backgroundColor,
    };

    // Clone the content to print
    const clonedElement = printRef.current.cloneNode(true) as HTMLElement;
    
    // Apply print-friendly styles to the clone
    const styles = document.createElement('style');
    styles.textContent = `
      @page {
        margin: 20mm;
        size: A4;
      }
      body {
        margin: 0;
        padding: 0;
        background-color: white;
      }
      @media print {
        * {
          box-sizing: border-box;
        }
        .material-icons {
          display: none;
        }
        button {
          display: none;
        }
      }
    `;
    
    clonedElement.appendChild(styles);
    
    // Create a container for printing
    const printContainer = document.createElement('div');
    printContainer.id = 'print-container';
    printContainer.style.position = 'fixed';
    printContainer.style.top = '0';
    printContainer.style.left = '0';
    printContainer.style.width = '100%';
    printContainer.style.height = '100%';
    printContainer.style.backgroundColor = 'white';
    printContainer.style.zIndex = '9999';
    printContainer.style.overflow = 'auto';
    printContainer.appendChild(clonedElement);
    
    // Hide original content and show print container
    document.body.style.overflow = 'hidden';
    document.body.style.backgroundColor = 'white';
    document.body.appendChild(printContainer);
    
    // Print the document
    setTimeout(() => {
      window.print();
      
      // Clean up after printing
      document.body.removeChild(printContainer);
      document.body.style.overflow = originalStyles.overflow;
      document.body.style.backgroundColor = originalStyles.backgroundColor;
    }, 300);
  };

  return { printRef, handlePrint };
}

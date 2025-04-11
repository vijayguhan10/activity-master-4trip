import React from 'react';

const ProgressBar = ({ currentStep }) => {
  const steps = [
    { label: "Personal Info" },
    { label: "Business Info" },
    { label: "Security" }
  ];

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-semibold mb-6">Registration Form</h2>
      <div className='w-full mt-2 flex items-center text-sm relative'>
        {/* Progress Line */}
        <div className='w-full h-[2px] bg-gray-200 absolute'></div>
        <div 
          className='h-[2px] bg-orange-500 absolute transition-all duration-300' 
          style={{width: `${(currentStep - 1) * 50}%`}}
        ></div>

        {/* Progress Points */}
        {steps.map((step, index) => (
          <div 
            key={index} 
            className='flex-1 flex flex-col items-center'
          >
            <div
              className={`w-3 h-3 rounded-full border-2 mb-2 ${
                currentStep === index + 1 
                  ? 'bg-orange-500 border-orange-500' 
                  : currentStep > index + 1 
                    ? 'bg-orange-500 border-orange-500' 
                    : 'bg-white border-gray-200'
              }`}
            ></div>
            <span className="text-gray-500 text-xs">{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;
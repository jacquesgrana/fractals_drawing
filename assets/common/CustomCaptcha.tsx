// assets/common/CustomCaptcha.tsx

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { CaptchaHandle } from '../types/indexType';


type CaptchaProps = {
  onVerify: (isVerified: boolean) => void;
};


// 1. On encapsule le composant dans forwardRef pour qu'il puisse recevoir une ref
const CustomCaptcha = forwardRef<CaptchaHandle, CaptchaProps>(({ onVerify }, ref) => {
  const MIN_VALUE = 0;
  const MAX_VALUE = 19;

  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [userInput, setUserInput] = useState('');

  const [isCaptchaValid, setIsCaptchaValid] = useState(false);

  const generateCaptcha = () => {
    setNum1(Math.floor(Math.random() * 10) + 1); // +1 pour éviter 0+0
    setNum2(Math.floor(Math.random() * 10));
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  // 2. On utilise useImperativeHandle pour exposer une fonction "reset"
  // Le parent pourra appeler cette fonction via la ref
  useImperativeHandle(ref, () => ({
    reset: () => {
      generateCaptcha();
      setUserInput('');
      // Important : on signale aussi au parent que le captcha n'est plus valide
      onVerify(false);
    }
  }));

  const handleChange = (e: any) => {
    setUserInput(e.target.value);
    const expectedResult = num1 + num2;
    // La vérification se fait en temps réel
    const isValid = parseInt(e.target.value, 10) === expectedResult;
    onVerify(isValid);
    // On signale au parent que le captcha est maintenant valide
    setIsCaptchaValid(isValid);
  };

    // Vérificateur centralisé
  const verify = (val: string) => {
    const intVal = parseInt(val, 10);
    const expected = num1 + num2;
    // Si c'est vide ou NaN, ce n'est pas valide
    if (isNaN(intVal)) {
        onVerify(false);
    } else {
        const isValid = intVal === expected;
        onVerify(isValid);
        // On signale au parent que le captcha est maintenant valide
        setIsCaptchaValid(isValid);
    }
  };

  const handleIncrement = () => {
    // Si vide, on commence à 1, sinon on ajoute 1
    const currentVal = userInput === '' ? 0 : parseInt(userInput, 10);
    if(currentVal < MAX_VALUE) {
        const newVal = (currentVal + 1).toString();
    setUserInput(newVal);
    verify(newVal);
    }
    
  };

  const handleDecrement = () => {
    const currentVal = userInput === '' ? 0 : parseInt(userInput, 10);
    // On évite les nombres négatifs (optionnel)

    if (currentVal > MIN_VALUE) {
        const newVal = (currentVal - 1).toString();
        setUserInput(newVal);
        verify(newVal);
    }
  };

  return (
    <div className='captcha-container'>
      {/* BOUTON MOINS */}
        
      <div className='d-flex flex-column align-items-center'>
        <label htmlFor="captcha"  className='text-large-black'>Combien font {num1} + {num2} ?</label>
        <div className='d-flex align-items-center gap-3'>
          <button 
            className="btn btn-primary" 
            type="button" // Important pour ne pas submit
            onClick={handleDecrement}
            disabled={userInput === `${MIN_VALUE}`}
        >
            -
        </button>
          <input 
            className={isCaptchaValid ? 'captcha-input-success captcha-field form-control' : 'captcha-field captcha-input-danger form-control'}
            id="captcha"
            type="number" 
            min="0" 
            max="21"
            readOnly={true}
            value={userInput} 
            //onChange={handleChange} 
            placeholder="0"
          />
          <button 
            className="btn btn-primary" 
            type="button" 
            onClick={handleIncrement}
            disabled={userInput === `${MAX_VALUE}`}
        >
            +
        </button>
        </div>
        
      </div>
              {/* BOUTON PLUS */}
        
    </div>
  );
});

export default CustomCaptcha;

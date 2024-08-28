import React, { useContext } from 'react';
import { LSystemContext } from '../contexts/LSystemContext';

const ControlPanel = () => {
  const { lSystem, setLSystem, visualParams, setVisualParams, presetSystems } = useContext(LSystemContext);

  const handleLSystemChange = (e) => {
    const { name, value } = e.target;
    setLSystem(prev => ({ ...prev, [name]: value }));
  };

  const handleRuleChange = (e) => {
    const { name, value } = e.target;
    setLSystem(prev => ({
      ...prev,
      rules: { ...prev.rules, [name]: value }
    }));
  };

  const handleVisualParamChange = (e) => {
    const { name, value } = e.target;
    setVisualParams(prev => ({ ...prev, [name]: value }));
  };

  const handlePresetChange = (e) => {
    const selectedPreset = presetSystems[e.target.value];
    setLSystem(selectedPreset);
  };

  return (
    <div className="control-panel">
      <label>
        Preset L-Systems:
        <select onChange={handlePresetChange}>
          {Object.entries(presetSystems).map(([key, system]) => (
            <option key={key} value={key}>{system.name}</option>
          ))}
        </select>
      </label>
      <label>
        Axiom:
        <input
          type="text"
          name="axiom"
          value={lSystem.axiom}
          onChange={handleLSystemChange}
        />
      </label>
      <label>
        Angle:
        <input
          type="number"
          name="angle"
          value={lSystem.angle}
          onChange={handleLSystemChange}
        />
      </label>
      <label>
        Iterations:
        <div className="iterations-control">
          <button onClick={() => handleLSystemChange({ target: { name: 'iterations', value: Math.max(1, lSystem.iterations - 1) } })}>-</button>
          <input
            type="number"
            name="iterations"
            value={lSystem.iterations}
            onChange={handleLSystemChange}
            min="1"
          />
          <button onClick={() => handleLSystemChange({ target: { name: 'iterations', value: lSystem.iterations + 1 } })}>+</button>
        </div>
      </label>
      <h3>Rules</h3>
      {Object.entries(lSystem.rules).map(([key, value]) => (
        <label key={key}>
          {key}:
          <input
            type="text"
            name={key}
            value={value}
            onChange={handleRuleChange}
          />
        </label>
      ))}
      <h2>Visual Settings</h2>
      <label>
        Line Color:
        <input
          type="color"
          name="lineColor"
          value={visualParams.lineColor}
          onChange={handleVisualParamChange}
        />
      </label>
      <label>
        Line Thickness:
        <input
          type="range"
          name="lineThickness"
          min="1"
          max="10"
          value={visualParams.lineThickness}
          onChange={handleVisualParamChange}
        />
      </label>
      <label>
        Zoom:
        <input
          type="range"
          name="zoom"
          min="0.1"
          max="2"
          step="0.1"
          value={visualParams.zoom}
          onChange={handleVisualParamChange}
        />
      </label>
    </div>
  );
};

export default ControlPanel;
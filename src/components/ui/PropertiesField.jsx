/**
 * @fileoverview Champs de formulaire réutilisables pour le panneau de propriétés
 */
import PropTypes from "prop-types";

/**
 * Champ numérique avec label et unité
 * @param {{ label:string, value:number, min:number, max:number,
 *           step:number, unit:string, onChange:Function }} props
 */
export function NumberField({ label, value, min, max, step, unit, onChange }) {
    return (
        <label className="flex flex-col gap-1">
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">
                {label}
            </span>
            <div className="flex items-center gap-1">
                <input
                    type="number"
                    value={Math.round(value)}
                    min={min}
                    max={max}
                    step={step}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1
                     text-sm text-slate-700 focus:outline-none focus:ring-2
                     focus:ring-blue-400 focus:border-transparent"
                />
                {unit && (
                    <span className="text-xs text-slate-400 shrink-0">
                        {unit}
                    </span>
                )}
            </div>
        </label>
    );
}

NumberField.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    min: PropTypes.number,
    max: PropTypes.number,
    step: PropTypes.number,
    unit: PropTypes.string,
    onChange: PropTypes.func.isRequired,
};

NumberField.defaultProps = {
    min: 0,
    max: 9999,
    step: 1,
    unit: "",
};

/**
 * Champ texte avec label
 * @param {{ label:string, value:string, placeholder:string, onChange:Function }} props
 */
export function TextField({ label, value, placeholder, onChange }) {
    return (
        <label className="flex flex-col gap-1">
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">
                {label}
            </span>
            <input
                type="text"
                value={value}
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1
                   text-sm text-slate-700 focus:outline-none focus:ring-2
                   focus:ring-blue-400 focus:border-transparent"
            />
        </label>
    );
}

TextField.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    onChange: PropTypes.func.isRequired,
};

TextField.defaultProps = { placeholder: "" };

/**
 * Slider avec label, valeur affichée et unité
 * @param {{ label:string, value:number, min:number, max:number,
 *           step:number, unit:string, onChange:Function }} props
 */
export function SliderField({ label, value, min, max, step, unit, onChange }) {
    return (
        <label className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">
                    {label}
                </span>
                <span className="text-[10px] text-slate-400">
                    {Math.round(value * 100) / 100}
                    {unit}
                </span>
            </div>
            <input
                type="range"
                value={value}
                min={min}
                max={max}
                step={step}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full accent-blue-500"
            />
        </label>
    );
}

SliderField.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    min: PropTypes.number,
    max: PropTypes.number,
    step: PropTypes.number,
    unit: PropTypes.string,
    onChange: PropTypes.func.isRequired,
};

SliderField.defaultProps = {
    min: 0,
    max: 1,
    step: 0.01,
    unit: "",
};

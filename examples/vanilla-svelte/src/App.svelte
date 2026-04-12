<script>
  import { FormEngine } from "@formhaus/core";
  import definition from "./definition.json";

  const engine = new FormEngine(definition);

  let fields = engine.visibleFields.slice();
  let vals = Object.assign({}, engine.values);
  let errs = Object.assign({}, engine.errors);
  let multi = engine.isMultiStep;
  let step = engine.currentStep;
  let first = engine.isFirstStep;
  let last = engine.isLastStep;

  function sync() {
    fields = engine.visibleFields.slice();
    vals = Object.assign({}, engine.values);
    errs = Object.assign({}, engine.errors);
    multi = engine.isMultiStep;
    step = engine.currentStep;
    first = engine.isFirstStep;
    last = engine.isLastStep;
  }

  engine.subscribe(() => sync());

  function setValue(key, value) {
    engine.setValue(key, value);
    sync();
  }

  function next() {
    engine.nextStep();
    sync();
  }

  function back() {
    engine.prevStep();
    sync();
  }

  function submit() {
    if (multi && !last) {
      next();
      return;
    }
    const result = engine.validate();
    sync();
    if (Object.keys(result).length === 0) {
      console.log("Submitted:", engine.getSubmitValues());
    }
  }
</script>

<div style="max-width: 480px; margin: 24px auto; font-family: sans-serif">
  <h2>{definition.title}</h2>
  {#if multi && step}
    <p style="color: #666; margin: 0 0 12px">{step.title}{step.description ? ' \u2014 ' + step.description : ''}</p>
  {/if}
  {#each fields as field}
    <div style="margin-bottom: 12px">
      <label for={field.key}>{field.label}</label>
      <br />
      {#if field.type === 'select'}
        <select id={field.key} on:change={e => setValue(field.key, e.target.value)}>
          <option value="">{field.placeholder || 'Select...'}</option>
          {#each field.options || [] as opt}
            <option value={opt.value}>{opt.label}</option>
          {/each}
        </select>
      {:else if field.type === 'checkbox'}
        <label><input type="checkbox" checked={vals[field.key] || false} on:change={e => setValue(field.key, e.target.checked)} /> {field.label}</label>
      {:else if field.type === 'radio'}
        {#each field.options || [] as opt}
          <label style="display: block"><input type="radio" name={field.key} value={opt.value} checked={vals[field.key] === opt.value} on:change={e => setValue(field.key, opt.value)} /> {opt.label}</label>
        {/each}
      {:else if field.type === 'switch'}
        <label><input type="checkbox" role="switch" checked={vals[field.key] || false} on:change={e => setValue(field.key, e.target.checked)} /> {field.label}</label>
      {:else if field.type === 'textarea'}
        <textarea id={field.key} rows={field.rows || 3} placeholder={field.placeholder || ''} on:input={e => setValue(field.key, e.target.value)}>{vals[field.key] || ''}</textarea>
      {:else}
        <input
          id={field.key}
          type={field.type === 'email' ? 'email' : field.type === 'password' ? 'password' : field.type === 'number' ? 'number' : 'text'}
          placeholder={field.placeholder || ''}
          value={vals[field.key] || ''}
          on:input={e => setValue(field.key, e.target.value)}
        />
      {/if}
      {#if field.helperText && !errs[field.key]}
        <p style="color: #666; margin: 4px 0 0; font-size: 13px">{field.helperText}</p>
      {/if}
      {#if errs[field.key]}
        <p style="color: red; margin: 4px 0 0; font-size: 13px">{errs[field.key]}</p>
      {/if}
    </div>
  {/each}
  <div style="display: flex; gap: 8px; margin-top: 16px">
    {#if multi && !first}
      <button on:click={back}>Back</button>
    {/if}
    <button on:click={submit}>{multi && !last ? 'Continue' : definition.submit.label}</button>
  </div>
</div>

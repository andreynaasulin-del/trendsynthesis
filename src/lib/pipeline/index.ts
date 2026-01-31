// ============================================
// TRENDSYNTHESIS — Pipeline Index
// ============================================

export { buildComposition, buildCompositions } from "./composition-builder";
export {
    runGenerationPipeline,
    createRenderQueue,
    PIPELINE_STAGES,
    type PipelineResult,
    type RenderJob,
    type ProgressCallback,
} from "./orchestrator";

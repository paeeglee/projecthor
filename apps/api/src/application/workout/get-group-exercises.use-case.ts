import type { IExerciseRepository } from "../../domain/exercise/exercise.repository";
import type { IWorkoutExerciseRepository } from "../../domain/workout/workout-exercise.repository";
import type { IWorkoutGroupRepository } from "../../domain/workout/workout-group.repository";
import type { IWorkoutLogRepository } from "../../domain/workout/workout-log.repository";
import type { IWorkoutSessionRepository } from "../../domain/workout/workout-session.repository";

interface GroupExerciseResponse {
  group: { id: string; label: string };
  exercises: Array<{
    id: string;
    exerciseName: string;
    sets: number;
    reps: number;
    restSeconds: number | null;
    notes: string | null;
    displayOrder: number;
    lastSession: Array<{ reps: number; weight: number }> | null;
  }>;
}

export class GetGroupExercisesUseCase {
  constructor(
    private readonly groupRepository: IWorkoutGroupRepository,
    private readonly exerciseRepository: IWorkoutExerciseRepository,
    private readonly catalogRepository: IExerciseRepository,
    private readonly sessionRepository: IWorkoutSessionRepository,
    private readonly logRepository: IWorkoutLogRepository,
  ) {}

  async execute(
    groupId: string,
    athleteId: string,
  ): Promise<GroupExerciseResponse | null> {
    const group = await this.groupRepository.findById(groupId);
    if (!group) return null;

    const exercises = await this.exerciseRepository.findByGroupId(groupId);

    const exerciseIds = exercises.map((e) => e.exerciseId);
    const catalog = await this.catalogRepository.findByIds(exerciseIds);
    const catalogMap = new Map(catalog.map((e) => [e.id, e]));

    let lastSessionLogs = new Map<
      string,
      Array<{ reps: number; weight: number }>
    >();
    const lastSession = await this.sessionRepository.findLastByGroupAndAthlete(
      groupId,
      athleteId,
    );
    if (lastSession) {
      const logs = await this.logRepository.findBySessionId(lastSession.id);
      for (const log of logs) {
        const existing = lastSessionLogs.get(log.workoutExerciseId) ?? [];
        existing.push({
          reps: log.repsCompleted,
          weight: log.weight,
        });
        lastSessionLogs.set(log.workoutExerciseId, existing);
      }
    }

    return {
      group: { id: group.id, label: group.label },
      exercises: exercises.map((e) => ({
        id: e.id,
        exerciseName: catalogMap.get(e.exerciseId)?.name ?? "Unknown exercise",
        sets: e.sets,
        reps: e.reps,
        restSeconds: e.restSeconds,
        notes: e.notes,
        displayOrder: e.displayOrder,
        lastSession: lastSessionLogs.get(e.id) ?? null,
      })),
    };
  }
}

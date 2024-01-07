/**
 * Represents a successful result.
 *
 * @template SuccessValue - The type of the success value.
 */
export type Success<SuccessValue> = readonly [success: SuccessValue, failure: undefined];

/**
 * Represents a failure result.
 *
 * @template FailureValue - The type of the failure value.
 */
export type Failure<FailureValue> = readonly [success: undefined, failure: FailureValue];

/**
 * Represents a result which can either be a success or a failure.
 *
 * @template SuccessValue - The type of the success value.
 * @template FailureValue - The type of the failure value.
 */
export type Result<SuccessValue, FailureValue> = Success<SuccessValue> | Failure<FailureValue>;

/**
 * Creates a success result.
 *
 * @template SuccessValue - The type of the success value.
 * @param value - The success value.
 * @returns A success result.
 *
 * @example
 * const result = success('Operation completed');
 *
 * console.log(unwrap(result)); // 'Operation completed'
 */
export function success<SuccessValue>(value: SuccessValue): Success<SuccessValue> {
  return [value, undefined];
}

/**
 * Creates a failure result.
 *
 * @template FailureValue - The type of the failure value.
 * @param value - The failure value.
 * @returns A failure result.
 *
 * @example
 * const result = failure('Operation failed');
 *
 * console.log(unwrap(result)); // 'Operation failed'
 */
export function failure<FailureValue>(value: FailureValue): Failure<FailureValue> {
  return [undefined, value];
}

/**
 * Checks if the given result is a success.
 *
 * @template SuccessValue - The type of the success value.
 * @param result - The result to check.
 * @returns `true` if the result is a success; otherwise, `false`.
 *
 * @example
 * const result = success('Operation completed');
 *
 * console.log(isSuccess(result)); // true
 */
export function isSuccess<SuccessValue>(result: Result<SuccessValue, unknown>): result is Success<SuccessValue> {
  return result[0] !== undefined;
}

/**
 * Checks if the given result is a failure.
 *
 * @template FailureValue - The type of the failure value.
 * @param result - The result to check.
 * @returns `true` if the result is a failure; otherwise, `false`.
 *
 * @example
 * const result = failure('Operation failed');
 *
 * console.log(isFailure(result)); // true
 */
export function isFailure<FailureValue>(result: Result<unknown, FailureValue>): result is Failure<FailureValue> {
  return result[1] !== undefined;
}

/**
 * Unwraps a success result, returning success value.
 *
 * @template SuccessValue - The type of the success value.
 * @param result - The success result to unwrap.
 * @returns The success value.
 *
 * @example
 * const result = success('Operation completed');
 *
 * console.log(unwrap(result)); // 'Operation completed'
 */
export function unwrap<SuccessValue>(result: Success<SuccessValue>): SuccessValue;

/**
 * Unwraps a failure result, returning failure value.
 *
 * @template FailureType - The type of the failure value.
 * @param result - The failure result to unwrap.
 * @returns The failure value.
 *
 * @example
 * const result = failure('Operation failed');
 *
 * console.log(unwrap(result)); // 'Operation failed'
 */
export function unwrap<FailureValue>(result: Failure<FailureValue>): FailureValue;

/**
 * Unwraps a result, returning either the success or failure value.
 *
 * @template SuccessValue - The type of the success value.
 * @template FailureValue - The type of the failure value.
 * @param result - The result to unwrap.
 * @returns The success or failure value.
 *
 * @example
 * function greaterThan42(input: number): Result<true, false> {
 *   return input > 42 ? success(true) : failure(false);
 * }
 *
 * const result = greaterThan42(42);
 *
 * if (isSuccess(result)) {
 *   console.log(unwrap(result)); // true
 * } else {
 *   console.log(unwrap(result)); // false
 * }
 */
export function unwrap<SuccessValue, FailureValue>(
  result: Result<SuccessValue, FailureValue>,
): FailureValue | SuccessValue;

export function unwrap<SuccessValue, FailureType>(
  result: Result<SuccessValue, FailureType>,
): FailureType | SuccessValue {
  return isSuccess(result) ? result[0] : result[1];
}

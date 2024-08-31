import styles from './textinput.module.scss';

type TextInputProps = JSX.IntrinsicElements['input'] & {
	label: string;
	required?: boolean;
};

export const TextInput = ({ label, required, ...props }: TextInputProps) => {
	return (
		<div className={styles.textInput}>
			<label className={styles.textInputLabel}>
				{label}
				{required ?
					<span className={styles.textInputRequired}>*</span>
				:	null}
			</label>
			<input
				className={styles.textInputField}
				aria-label={label}
				aria-required={required || false}
				{...props}
			/>
		</div>
	);
};

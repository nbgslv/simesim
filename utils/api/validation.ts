import * as yup from 'yup';

// eslint-disable-next-line import/prefer-default-export
export const deleteSchema = yup.object({
  action: yup.string().oneOf(['deleteMany', 'delete']).required(),
  input: yup.object().when('action', {
    is: 'delete',
    then: yup
      .object({
        where: yup.object({
          id: yup.string().required(),
        }),
      })
      .required(),
    otherwise: yup.object({
      where: yup
        .object({
          id: yup
            .object({
              in: yup.array().of(yup.string()).required(),
            })
            .required(),
        })
        .required(),
    }),
  }),
});
